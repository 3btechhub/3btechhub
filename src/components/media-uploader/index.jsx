import React, { useState } from "react";
import { uploadMedia } from "../../services/storage.js";

export function MediaUploader({ value, onChange, accept="image/*", disabled=false }) {
  const [status, setStatus] = useState("");
  const [preview, setPreview] = useState(value?.url || "");
  async function handleChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setStatus("Uploading…");
    try {
      const media = await uploadMedia(file);
      setPreview(media.url);
      onChange?.(media);
      setStatus("Uploaded");
    } catch (error) {
      setStatus(error.message || "Upload failed");
    }
  }
  return <div className="field-stack">
    <label className="field-label">Media</label>
    <input type="file" accept={accept} disabled={disabled} onChange={handleChange} />
    {preview && <img className="media-preview" src={preview} alt="Selected media preview" />}
    {status && <small role="status">{status}</small>}
  </div>;
}