import { supabase } from "../../components/supabase-client.js";

/*
 * INTRO DATA LAYER
 * Single source of truth: public.intro_content (id = 1).
 * Public visitors read content according to the table's existing RLS policy.
 * Updates are restricted by the existing module.intro.manage permission.
 */

const INTRO_ROW_ID = 1;

export async function getIntroContent() {
  const { data, error } = await supabase
    .from("intro_content")
    .select("heading, sub_heading, visible_role_ids")
    .eq("id", INTRO_ROW_ID)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function updateIntroContent({ heading, description, visibleRoleIds }) {
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError) throw userError;
  if (!user) throw new Error("Please log in to update the Intro.");
  if (!Array.isArray(visibleRoleIds) || visibleRoleIds.length === 0) {
    throw new Error("Select at least the Owner role for Intro visibility.");
  }

  const { data, error } = await supabase
    .from("intro_content")
    .update({
      heading: String(heading || "").trim(),
      sub_heading: String(description || "").trim(),
      visible_role_ids: visibleRoleIds,
      updated_by: user.id,
      updated_at: new Date().toISOString()
    })
    .eq("id", INTRO_ROW_ID)
    .select("heading, sub_heading, visible_role_ids")
    .single();

  if (error) throw error;
  return data;
}
