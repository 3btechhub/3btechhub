import { requireSupabase } from "../database/client.js";
export async function uploadMedia(file) {
  if (!file) throw new Error("Choose a file first.");
  // Allowed types and maximum size are intentionally not guessed; pending Notion decisions.
  const client = requireSupabase();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
  const path = `${Date.now()}-${safeName}`;
  const { data, error } = await client.storage.from("media").upload(path, file, { upsert: false });
  if (error) throw error;
  const { data: publicData } = client.storage.from("media").getPublicUrl(data.path);
  return { path: data.path, url: publicData.publicUrl, name: file.name, type: file.type };
}