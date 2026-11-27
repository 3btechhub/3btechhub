import { requireSupabase } from "../client.js";
export const relationTable = "relations";
export async function listRelations() { const { data, error } = await requireSupabase().from(relationTable).select("*"); if (error) throw error; return data; }
export function canonicalPair(sourceType, sourceId, targetType, targetId) {
  const left = `${sourceType}:${sourceId}`, right = `${targetType}:${targetId}`;
  return left < right ? [left, right] : [right, left];
}