import { requireSupabase } from "../client.js";
export const mediaTable = "media";
export async function listMedia() { const { data, error } = await requireSupabase().from(mediaTable).select("*"); if (error) throw error; return data; }