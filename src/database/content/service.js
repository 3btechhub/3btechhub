import { requireSupabase } from "../client.js";
export const serviceTable = "services";
export async function listServices() { const { data, error } = await requireSupabase().from(serviceTable).select("*"); if (error) throw error; return data; }