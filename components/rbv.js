import { supabase } from "./supabase-client.js";

const OWNER_SLUG = "owner";

export async function getActiveRoles() {
  const { data, error } = await supabase
    .from("roles")
    .select("id, name, slug")
    .eq("is_active", true)
    .order("name");

  if (error) throw error;
  return data || [];
}

export function withRequiredOwner(roleIds, roles) {
  const owner = roles.find(role => role.slug === OWNER_SLUG);
  const selected = new Set((roleIds || []).filter(Boolean));
  if (owner) selected.add(owner.id);
  return [...selected];
}

export async function getTargetVisibility(targetType, targetKey) {
  const { data, error } = await supabase
    .from("rbv_visibility")
    .select("visible_role_ids")
    .eq("target_type", targetType)
    .eq("target_key", targetKey)
    .maybeSingle();

  if (error) throw error;
  return data?.visible_role_ids || [];
}

/*
 * Runtime visibility helper.
 * For anonymous visitors, rbv_visibility RLS returns a row only when the
 * Visitor role is included. For signed-in users, the user's active roles
 * must intersect the configured role IDs.
 * Database RLS remains the security boundary for protected data.
 */
export async function canSeeTarget(targetType, targetKey) {
  if (!targetType || !targetKey) return false;

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;

  const { data: visibility, error: visibilityError } = await supabase
    .from("rbv_visibility")
    .select("visible_role_ids")
    .eq("target_type", targetType)
    .eq("target_key", targetKey)
    .maybeSingle();

  if (visibilityError) throw visibilityError;
  if (!visibility) return false;

  const roleIds = visibility.visible_role_ids || [];
  if (!roleIds.length) return false;

  // Anonymous SELECT is already filtered by the Visitor visibility RLS policy.
  if (!user) return true;

  const { data, error } = await supabase
    .from("user_roles")
    .select("role_id, roles!inner(is_active)")
    .eq("user_id", user.id)
    .eq("roles.is_active", true);

  if (error) throw error;
  return (data || []).some(item => roleIds.includes(item.role_id));
}

class RbvVisibility extends HTMLElement {
  connectedCallback() {
    if (this.dataset.initialized === "true") return;
    this.dataset.initialized = "true";
    this.hidden = true;

    canSeeTarget(this.dataset.targetType, this.dataset.targetKey)
      .then(visible => { this.hidden = !visible; })
      .catch(error => {
        console.error("RBV visibility check failed.", error);
        this.hidden = true;
      });
  }
}

if (!customElements.get("rbv-visibility")) {
  customElements.define("rbv-visibility", RbvVisibility);
}
