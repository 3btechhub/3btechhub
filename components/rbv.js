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
 * RBV authorization is decided by the Supabase RPC.
 * The RPC validates auth.uid(), active user_roles, the Visitor role for
 * anonymous sessions, and the configured visible_role_ids in one query.
 * This browser function only requests the authorization decision.
 */
export async function canSeeTarget(targetType, targetKey) {
  if (!targetType || !targetKey) return false;

  const { data, error } = await supabase.rpc("can_see_target", {
    p_target_type: targetType,
    p_target_key: targetKey
  });

  if (error) throw error;
  return data === true;
}

class RbvVisibility extends HTMLElement {
  connectedCallback() {
    if (this.dataset.initialized === "true") return;
    this.dataset.initialized = "true";
    this.hidden = true;
    this.style.display = "none";

    canSeeTarget(this.dataset.targetType, this.dataset.targetKey)
      .then(authorized => {
        this.hidden = !authorized;
        this.style.display = authorized ? "contents" : "none";
      })
      .catch(error => {
        console.error("Supabase RBV authorization failed.", error);
        this.hidden = true;
        this.style.display = "none";
      });
  }
}

if (!customElements.get("rbv-visibility")) {
  customElements.define("rbv-visibility", RbvVisibility);
}
