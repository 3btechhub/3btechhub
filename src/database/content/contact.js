import { requireSupabase } from "../client.js";
export const contactTable = "contacts";
export async function listContacts() { const { data, error } = await requireSupabase().from(contactTable).select("*"); if (error) throw error; return data; }