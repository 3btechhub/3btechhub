import { requireSupabase } from "../client.js";
export const roleTable = "roles";
export async function listRoles() { const { data, error } = await requireSupabase().from(roleTable).select("*"); if (error) throw error; return data; }