import { requireSupabase } from "../client.js";
export const workshopTable = "workshops";
export async function listWorkshops() { const { data, error } = await requireSupabase().from(workshopTable).select("*"); if (error) throw error; return data; }