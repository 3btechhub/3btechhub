import { uploadMedia } from "./media-service.js";

class MediaUpload extends HTMLElement {
  connectedCallback() {
    if (this.dataset.initialized === "true") return;
    this.dataset.initialized = "true";
    this.render();
  }

  render() {
    this.innerHTML = `
      <section class="media-library-upload" aria-label="Upload media">
        <input class="media-library-upload__file" type="file" hidden>
        <button class="medium-button media-library-upload__select" type="button">Select File</button>
        <input class="medium-input media-library-upload__url" type="url" inputmode="url" placeholder="URL" aria-label="File URL">
        <button class="medium-button media-library-upload__submit" type="button" disabled>Upload</button>
        <p class="media-library-upload__status" role="status" aria-live="polite" hidden></p>
      </section>
    `;

    this.fileInput = this.querySelector(".media-library-upload__file");
    this.selectButton = this.querySelector(".media-library-upload__select");
    this.urlInput = this.querySelector(".media-library-upload__url");
    this.uploadButton = this.querySelector(".media-library-upload__submit");
    this.status = this.querySelector(".media-library-upload__status");

    this.selectButton.addEventListener("click", () => this.fileInput.click());
    this.fileInput.addEventListener("change", () => {
      if (this.fileInput.files?.length) this.urlInput.value = "";
      this.syncState();
      if (this.fileInput.files?.length) this.showStatus(this.fileInput.files[0].name);
    });
    this.urlInput.addEventListener("input", () => {
      if (this.urlInput.value.trim()) this.fileInput.value = "";
      this.syncState();
      this.clearStatus();
    });
    this.uploadButton.addEventListener("click", () => this.handleUpload());
    this.syncState();
  }

  syncState() {
    const hasFile = Boolean(this.fileInput?.files?.length);
    const hasUrl = Boolean(this.urlInput?.value.trim());
    this.selectButton.disabled = hasUrl || this.uploading;
    this.urlInput.disabled = hasFile || this.uploading;
    this.uploadButton.disabled = (!hasFile && !hasUrl) || this.uploading;
  }

  async handleUpload() {
    const file = this.fileInput.files?.[0] || null;
    const url = this.urlInput.value.trim();
    if (!file && !url) return;

    this.uploading = true;
    this.syncState();
    this.showStatus("Uploading…");

    try {
      const asset = await uploadMedia({
        file,
        url,
        visibility: this.dataset.visibility === "public" ? "public" : "private"
      });
      this.fileInput.value = "";
      this.urlInput.value = "";
      this.showStatus("Upload complete.");
      this.dispatchEvent(new CustomEvent("media-uploaded", {
        bubbles: true,
        composed: true,
        detail: { asset }
      }));
    } catch (error) {
      this.showStatus(error?.message || "Upload failed.", true);
    } finally {
      this.uploading = false;
      this.syncState();
    }
  }

  showStatus(message, isError = false) {
    this.status.hidden = false;
    this.status.textContent = message;
    this.status.dataset.state = isError ? "error" : "success";
  }

  clearStatus() {
    this.status.hidden = true;
    this.status.textContent = "";
    delete this.status.dataset.state;
  }
}

if (!customElements.get("media-upload")) {
  customElements.define("media-upload", MediaUpload);
}
