import { requireSupabase } from "../client.js";
export const auditsTable = "audits";
export async function listAudits() { const { data, error } = await requireSupabase().from(auditsTable).select("*"); if (error) throw error; return data; }