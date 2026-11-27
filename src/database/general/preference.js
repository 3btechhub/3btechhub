import { requireSupabase } from "../client.js";
export const preferenceTable = "preference";
export async function listPreferences() { const { data, error } = await requireSupabase().from(preferenceTable).select("*"); if (error) throw error; return data; }