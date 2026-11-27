import { requireSupabase } from "../client.js";
export const technicianTable = "technicians";
export async function listTechnicians() { const { data, error } = await requireSupabase().from(technicianTable).select("*"); if (error) throw error; return data; }