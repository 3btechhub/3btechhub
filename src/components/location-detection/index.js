import { supabase } from "../../database/client.js";

export async function detectRegion() {
  if (!supabase) return { region: "Global", slug: "global", source: "fallback" };
  const { data, error } = await supabase.functions.invoke("region-detection");
  if (error || !data?.slug) return { region: "Global", slug: "global", source: "fallback" };
  return data;
}
