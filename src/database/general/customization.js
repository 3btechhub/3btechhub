import { requireSupabase } from "../client.js";
export const customizationTable = "customization";
export async function listCustomizations() { const { data, error } = await requireSupabase().from(customizationTable).select("*"); if (error) throw error; return data; }