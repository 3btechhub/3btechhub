(() => {
  "use strict";
  window.__3bComponents = window.__3bComponents || {};
  window.__3bComponents.imageUpload = {
    bind({ input, preview, upload, publicUrl, status, onStart, onUploaded }) {
      if (!input || typeof upload !== "function") return;
      input.addEventListener("change", async event => {
        const file = event.target.files?.[0];
        if (!file) return;
        onStart?.(file);
        try {
          status?.("Uploading image…");
          const path = await upload(file);
          if (preview) {
            preview.src = publicUrl(path);
            preview.hidden = false;
          }
          onUploaded?.(path, file);
          status?.("Image uploaded. Save to apply it.");
        } catch (error) {
          status?.(error.message || "Image upload failed.");
          event.target.value = "";
        }
      });
    }
  };
})();
