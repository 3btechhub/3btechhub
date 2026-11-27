import { requireSupabase } from "../client.js";
export const productTable = "products";
export async function listProducts() { const { data, error } = await requireSupabase().from(productTable).select("*"); if (error) throw error; return data; }