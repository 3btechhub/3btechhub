import { supabase } from "../system/supabase-client.js";

export const MEDIA_BUCKET = "site-media";
export const MEDIA_MAX_FILE_SIZE = 10 * 1024 * 1024;

const MIME_BY_EXTENSION = {
  jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp",
  gif: "image/gif", avif: "image/avif", svg: "image/svg+xml", ico: "image/x-icon",
  mp4: "video/mp4", webm: "video/webm", mov: "video/quicktime", mpeg: "video/mpeg",
  mp3: "audio/mpeg", wav: "audio/wav", ogg: "audio/ogg", aac: "audio/aac",
  pdf: "application/pdf", doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ppt: "application/vnd.ms-powerpoint",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  txt: "text/plain", csv: "text/csv", zip: "application/zip"
};

const BLOCKED_EXTENSIONS = new Set([
  "html", "htm", "xhtml", "js", "mjs", "cjs", "php", "phtml",
  "exe", "dll", "bat", "cmd", "ps1", "sh", "jar", "com", "scr"
]);

const BLOCKED_MIME_TYPES = new Set([
  "text/html", "application/xhtml+xml", "application/javascript",
  "text/javascript", "application/x-msdownload", "application/x-executable"
]);

function getExtension(fileName = "") {
  const match = String(fileName).toLowerCase().match(/\.([a-z0-9]{1,12})$/);
  return match ? match[1] : "";
}

function inferMime(fileName, suppliedMime = "") {
  const normalized = String(suppliedMime || "").split(";")[0].trim().toLowerCase();
  if (normalized && normalized !== "application/octet-stream") return normalized;
  return MIME_BY_EXTENSION[getExtension(fileName)] || normalized || "application/octet-stream";
}

function getCategory(mimeType, fileName) {
  const extension = getExtension(fileName);
  if (["svg", "ico"].includes(extension) || ["image/svg+xml", "image/x-icon", "image/vnd.microsoft.icon"].includes(mimeType)) return "icon";
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType.startsWith("audio/")) return "audio";
  if (
    mimeType === "application/pdf" ||
    mimeType.startsWith("application/msword") ||
    mimeType.includes("wordprocessingml") ||
    mimeType.includes("spreadsheetml") ||
    mimeType.includes("presentationml") ||
    mimeType === "application/vnd.ms-excel" ||
    mimeType === "application/vnd.ms-powerpoint" ||
    mimeType.startsWith("text/") ||
    mimeType === "application/rtf" ||
    mimeType === "application/zip"
  ) return "document";
  return "other";
}

function safeStorageName(fileName) {
  const extension = getExtension(fileName);
  const base = String(fileName || "file")
    .replace(/\.[^.]+$/, "")
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70) || "file";
  return extension ? `${base}.${extension}` : base;
}

function validateFile(file) {
  if (!file || !(file instanceof Blob)) throw new Error("Select a file or enter a URL.");
  if (file.size <= 0) throw new Error("The selected file is empty.");
  if (file.size > MEDIA_MAX_FILE_SIZE) throw new Error("The file exceeds the 10 MB upload limit.");

  const extension = getExtension(file.name);
  const mimeType = inferMime(file.name, file.type);
  if (BLOCKED_EXTENSIONS.has(extension) || BLOCKED_MIME_TYPES.has(mimeType)) {
    throw new Error("This file type is not allowed.");
  }

  return { mimeType, category: getCategory(mimeType, file.name) };
}

async function fileFromUrl(value) {
  let parsed;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error("Enter a valid file URL.");
  }
  if (!["http:", "https:"].includes(parsed.protocol) || parsed.username || parsed.password) {
    throw new Error("Only public HTTP or HTTPS file URLs are supported.");
  }

  let response;
  try {
    response = await fetch(parsed.href, { method: "GET", mode: "cors", credentials: "omit" });
  } catch {
    throw new Error("This URL does not allow browser access (CORS). Select the file from your device instead.");
  }
  if (!response.ok) throw new Error(`The URL returned an error (${response.status}).`);
  const contentLength = Number(response.headers.get("content-length") || 0);
  if (contentLength > MEDIA_MAX_FILE_SIZE) throw new Error("The URL file exceeds the 10 MB upload limit.");

  const blob = await response.blob();
  if (blob.size > MEDIA_MAX_FILE_SIZE) throw new Error("The URL file exceeds the 10 MB upload limit.");
  let urlName = parsed.pathname.split("/").filter(Boolean).pop() || "download";
  try { urlName = decodeURIComponent(urlName); } catch { /* Keep the encoded filename. */ }
  const contentType = response.headers.get("content-type") || blob.type;
  const mimeType = inferMime(urlName, contentType);
  const extension = getExtension(urlName);
  const inferredExtension = extension || Object.entries(MIME_BY_EXTENSION).find(([, value]) => value === mimeType)?.[0] || "bin";
  const fileName = extension ? urlName : `${urlName}.${inferredExtension}`;

  return new File([blob], fileName, { type: mimeType });
}

export async function uploadMedia({ file, url, visibility = "private" }) {
  const hasFile = Boolean(file);
  const hasUrl = Boolean(String(url || "").trim());
  if (hasFile === hasUrl) throw new Error("Use Select File or URL, not both.");

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError) throw authError;
  if (!user) throw new Error("Please log in before uploading files.");

  const sourceType = file ? "file" : "url";
  const selectedFile = file || await fileFromUrl(url);
  const { mimeType, category } = validateFile(selectedFile);

  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const storageName = safeStorageName(selectedFile.name);
  const uniqueName = `${crypto.randomUUID()}-${storageName}`;
  const storagePath = `${category === "image" ? "images" : category === "video" ? "videos" : category === "icon" ? "icons" : category === "audio" ? "audio" : category === "document" ? "documents" : "others"}/${year}/${month}/${uniqueName}`;
  const fileVisibility = visibility === "public" ? "public" : "private";

  const { error: uploadError } = await supabase.storage
    .from(MEDIA_BUCKET)
    .upload(storagePath, selectedFile, {
      cacheControl: "3600",
      contentType: mimeType,
      upsert: false
    });
  if (uploadError) throw uploadError;

  const { data, error: insertError } = await supabase
    .from("media_assets")
    .insert({
      file_name: selectedFile.name,
      mime_type: mimeType,
      file_category: category,
      storage_path: storagePath,
      file_size: selectedFile.size,
      visibility: fileVisibility,
      source_type: sourceType,
      uploaded_by: user.id
    })
    .select("id, file_name, mime_type, file_category, storage_path, file_size, visibility, source_type, uploaded_by, created_at")
    .single();

  if (insertError) {
    await supabase.storage.from(MEDIA_BUCKET).remove([storagePath]);
    throw insertError;
  }

  return data;
}

export async function listMediaAssets({ category, search, limit = 50 } = {}) {
  let query = supabase
    .from("media_assets")
    .select("id, file_name, mime_type, file_category, storage_path, file_size, visibility, source_type, uploaded_by, created_at")
    .order("created_at", { ascending: false })
    .limit(Math.min(Math.max(Number(limit) || 50, 1), 100));

  if (category) query = query.eq("file_category", category);
  if (search) query = query.ilike("file_name", `%${String(search).replace(/[,%_]/g, "")}%`);

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function getMediaAsset(id) {
  const { data, error } = await supabase
    .from("media_assets")
    .select("id, file_name, mime_type, file_category, storage_path, file_size, visibility, source_type, uploaded_by, created_at")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function getMediaAssetUrl(id, expiresIn = 3600) {
  const asset = await getMediaAsset(id);
  const { data, error } = await supabase.storage
    .from(MEDIA_BUCKET)
    .createSignedUrl(asset.storage_path, Math.min(Math.max(Number(expiresIn) || 3600, 60), 604800));

  if (error) throw error;
  return data.signedUrl;
}


const SERVICE_CATEGORY_BUCKETS = {
  image: "service-images",
  icon: "service-icons"
};

const SERVICE_ICON_MIME_TYPES = new Set([
  "image/svg+xml", "image/x-icon", "image/vnd.microsoft.icon", "image/png", "image/webp"
]);

export async function uploadServiceCategoryAsset({ file, kind }) {
  const bucket = SERVICE_CATEGORY_BUCKETS[kind];
  if (!bucket) throw new Error("Unknown service category asset type.");
  if (!file || !(file instanceof Blob)) throw new Error("Select a file to upload.");
  if (file.size <= 0) throw new Error("The selected file is empty.");
  if (file.size > MEDIA_MAX_FILE_SIZE) throw new Error("The file exceeds the 10 MB upload limit.");

  const mimeType = inferMime(file.name, file.type);
  if (kind === "image" && !mimeType.startsWith("image/")) {
    throw new Error("Select an image file.");
  }
  if (kind === "icon" && !SERVICE_ICON_MIME_TYPES.has(mimeType)) {
    throw new Error("Select an SVG, ICO, PNG, or WebP icon file.");
  }
  if (BLOCKED_EXTENSIONS.has(getExtension(file.name)) || BLOCKED_MIME_TYPES.has(mimeType)) {
    throw new Error("This file type is not allowed.");
  }

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError) throw authError;
  if (!user) throw new Error("Please log in before uploading files.");

  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const storagePath = `${year}/${month}/${crypto.randomUUID()}-${safeStorageName(file.name)}`;
  const { error: uploadError } = await supabase.storage.from(bucket).upload(storagePath, file, {
    cacheControl: "3600",
    contentType: mimeType,
    upsert: false
  });
  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from(bucket).getPublicUrl(storagePath);
  return {
    bucket,
    storage_path: storagePath,
    public_url: data.publicUrl,
    file_name: file.name,
    mime_type: mimeType
  };
}
