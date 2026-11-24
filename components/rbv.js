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
 * Database RLS remains the security boundary; this helper controls rendering.
 */
export async function canSeeTarget(targetType, targetKey) {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;

  const roleIds = await getTargetVisibility(targetType, targetKey);
  if (!roleIds.length) return false;

  if (!user) {
    const roles = await getActiveRoles();
    const visitor = roles.find(role => role.slug === "visitor");
    return Boolean(visitor && roleIds.includes(visitor.id));
  }

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
