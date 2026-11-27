import { requireSupabase } from "../client.js";
export const userTable = "users";
export async function listUsers() { const { data, error } = await requireSupabase().from(userTable).select("*"); if (error) throw error; return data; }