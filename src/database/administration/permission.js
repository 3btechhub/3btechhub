import { requireSupabase } from "../client.js";
export const permissionTable = "permissions";
export async function listPermissions() { const { data, error } = await requireSupabase().from(permissionTable).select("*"); if (error) throw error; return data; }