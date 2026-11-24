import { uploadMedia, getMediaAssetUrl, uploadServiceCategoryAsset } from "./media-service.js";
import "../cards/large-card.js";

class MediaUpload extends HTMLElement {
  connectedCallback() {
    if (this.dataset.initialized === "true") return;
    this.dataset.initialized = "true";
    this.render();
  }

  render() {
    const wrapper = this.hasAttribute("embedded") ? "div" : "large-card";
    this.innerHTML = `
      <${wrapper} class="media-library-upload" aria-label="Upload media">
        <input class="media-library-upload__file" type="file" hidden>
        <input class="medium-input media-library-upload__url" type="url" inputmode="url" placeholder="${this.getAttribute("placeholder") || "File URL or external URL"}" aria-label="Media URL">
        <div class="media-library-upload__actions">
          <button class="medium-button media-library-upload__select" type="button">Select File</button>
          <button class="medium-button media-library-upload__submit" type="button" disabled>Upload</button>
        </div>
        <p class="media-library-upload__status" role="status" aria-live="polite" hidden></p>
      </${wrapper}>
    `;

    this.fileInput = this.querySelector(".media-library-upload__file");
    this.selectButton = this.querySelector(".media-library-upload__select");
    this.urlInput = this.querySelector(".media-library-upload__url");
    this.uploadButton = this.querySelector(".media-library-upload__submit");
    this.status = this.querySelector(".media-library-upload__status");
    this.fileInput.accept = this.getAttribute("accept") || "";

    this.selectButton.addEventListener("click", () => this.fileInput.click());

    this.fileInput.addEventListener("change", () => {
      const file = this.fileInput.files?.[0];
      if (file) {
        this.urlInput.value = "";
        this.urlInput.dispatchEvent(new CustomEvent("media-url-changed", {
          bubbles: true,
          composed: true,
          detail: { url: "" }
        }));
        this.showStatus(file.name);
      } else {
        this.clearStatus();
      }
      this.syncState();
    });

    this.urlInput.addEventListener("input", () => {
      if (this.urlInput.value.trim()) this.fileInput.value = "";
      this.syncState();
      this.clearStatus();
      this.dispatchEvent(new CustomEvent("media-url-changed", {
        bubbles: true,
        composed: true,
        detail: { url: this.urlInput.value.trim() }
      }));
    });

    this.uploadButton.addEventListener("click", () => this.handleUpload());
    this.syncState();
  }

  syncState() {
    const hasFile = Boolean(this.fileInput?.files?.length);
    this.selectButton.disabled = Boolean(this.uploading);
    this.urlInput.disabled = Boolean(this.uploading);
    this.uploadButton.disabled = !hasFile || Boolean(this.uploading);
  }

  async handleUpload() {
    const file = this.fileInput.files?.[0] || null;
    if (!file || this.uploading) return;

    this.uploading = true;
    this.syncState();
    this.showStatus("Uploading…");

    try {
      const assetKind = this.getAttribute("asset-kind");
      let asset;
      let url;
      if (assetKind === "service-image" || assetKind === "service-icon") {
        const kind = assetKind === "service-image" ? "image" : "icon";
        asset = await uploadServiceCategoryAsset({ file, kind });
        url = asset.public_url;
      } else {
        asset = await uploadMedia({
          file,
          url: "",
          visibility: this.dataset.visibility === "public" ? "public" : "private"
        });
        url = await getMediaAssetUrl(asset.id);
      }

      this.urlInput.value = url;
      this.fileInput.value = "";
      this.urlInput.dispatchEvent(new CustomEvent("media-url-changed", {
        bubbles: true,
        composed: true,
        detail: { url }
      }));
      this.showStatus("Upload complete.");
      this.dispatchEvent(new CustomEvent("media-uploaded", {
        bubbles: true,
        composed: true,
        detail: { asset, url }
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
