import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://3btechhub.github.io",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Vary": "Origin",
};

function jsonResponse(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

function escapeHtml(value: unknown): string {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[char]!);
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "GET") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const authHeader = req.headers.get("Authorization") || "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  if (!token) {
    return jsonResponse({ error: "Authentication required" }, 401);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  if (!supabaseUrl || !anonKey) {
    return jsonResponse({ error: "Server configuration error" }, 500);
  }

  const supabase = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: authData, error: authError } = await supabase.auth.getUser(token);
  const user = authData.user;
  if (authError || !user) {
    return jsonResponse({ error: "Invalid or expired session" }, 401);
  }

  // A user's effective access is the union of permissions granted by their
  // active database roles. There are no user-specific visibility overrides.
  const { data: assignments, error: assignmentsError } = await supabase
    .from("user_roles")
    .select("role_id")
    .eq("user_id", user.id);
  if (assignmentsError) {
    console.error("Unable to load user role assignments:", assignmentsError);
    return jsonResponse({ error: "Unable to verify access" }, 500);
  }

  const assignedRoleIds = [...new Set((assignments || []).map((row) => row.role_id))];
  let roles: Array<{ id: string; slug: string; name: string }> = [];
  let permissionSlugs: string[] = [];

  if (assignedRoleIds.length > 0) {
    const { data: activeRoles, error: rolesError } = await supabase
      .from("roles")
      .select("id, slug, name")
      .in("id", assignedRoleIds)
      .eq("is_active", true);
    if (rolesError) {
      console.error("Unable to load active roles:", rolesError);
      return jsonResponse({ error: "Unable to verify access" }, 500);
    }
    roles = activeRoles || [];

    const activeRoleIds = roles.map((role) => role.id);
    if (activeRoleIds.length > 0) {
      const { data: grants, error: grantsError } = await supabase
        .from("role_permissions")
        .select("permission_id")
        .in("role_id", activeRoleIds);
      if (grantsError) {
        console.error("Unable to load role permissions:", grantsError);
        return jsonResponse({ error: "Unable to verify access" }, 500);
      }

      const permissionIds = [...new Set((grants || []).map((grant) => grant.permission_id))];
      if (permissionIds.length > 0) {
        const { data: permissions, error: permissionsError } = await supabase
          .from("permissions")
          .select("slug")
          .in("id", permissionIds);
        if (permissionsError) {
          console.error("Unable to load permissions:", permissionsError);
          return jsonResponse({ error: "Unable to verify access" }, 500);
        }
        permissionSlugs = [...new Set((permissions || []).map((permission) => permission.slug))];
      }
    }
  }

  // The Owner role is system-authorized by private.has_permission(); mirror that effective access in the client permission list.
  if (roles.some((role) => role.slug === "owner")) {
    permissionSlugs = [...new Set([
      ...permissionSlugs,
      "module.our_services.manage",
      "module.related_products.manage",
    ])];
  }

  const permissionSet = new Set(permissionSlugs);
  const page = new URL(req.url).searchParams.get("page");

  if (page === "visibility") {
    return jsonResponse({
      permissions: permissionSlugs,
      roles: roles.map((role) => ({ slug: role.slug, name: role.name })),
    });
  }

  const requiredPermission = page === "account"
    ? "page.account.view"
    : page === "dashboard"
    ? "page.dashboard.view"
    : null;

  if (!requiredPermission) {
    return jsonResponse({ error: "Page not allowed" }, 404);
  }
  if (!permissionSet.has(requiredPermission)) {
    return jsonResponse({ error: "Your role does not have access to this page" }, 403);
  }

  let html = "";
  if (page === "account") {
    const metadata = user.user_metadata || {};
    const name = metadata.full_name || metadata.name ||
      [metadata.first_name, metadata.last_name].filter(Boolean).join(" ") ||
      user.email?.split("@")[0] || "Not provided";
    const roleNames = roles.map((role) => role.name).join(", ") || "Not assigned";

    html = `<section class="ui-large-card ui-size-large ui-auth-section-card">
      <div class="ui-account-field"><span class="ui-account-field-label">Name</span><div class="ui-account-field-value">${escapeHtml(name)}</div></div>
      <div class="ui-account-field"><span class="ui-account-field-label">Email</span><div class="ui-account-field-value">${escapeHtml(user.email || "Not provided")}</div></div>
      <div class="ui-account-field"><span class="ui-account-field-label">Role</span><div class="ui-account-field-value">${escapeHtml(roleNames)}</div></div>
      <button class="ui-button ui-button-primary ui-button-block" id="logout-button" type="button">Logout</button><p class="ui-form-status" id="status" role="status" aria-live="polite"></p></section>`;
  } else {
    html = `<main id="dashboard-content" data-context="dashboard"></main>`;
  }

  return jsonResponse({ html, permissions: permissionSlugs });
});