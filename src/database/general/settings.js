import { requireSupabase } from "../client.js";
export const settingsTable = "settings";
export async function listSettings() { const { data, error } = await requireSupabase().from(settingsTable).select("*"); if (error) throw error; return data; }