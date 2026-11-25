import { supabase } from "../supabase-client.js";
import { getMediaAssetUrl } from "../media/media.js";
import "../media/media-uploader.js";
import "../slug.js";
import "../cards/large-card.js";
import "../visibility/rbv-editor.js";

const MEDIA_REFERENCE_PREFIX = "media:";

function storedMediaValue(assetId) {
  return assetId ? MEDIA_REFERENCE_PREFIX + assetId : "";
}

function isStoredMediaReference(value) {
  return String(value || "").startsWith(MEDIA_REFERENCE_PREFIX);
}

async function displayMediaUrl(value) {
  if (!value) return "";
  if (!isStoredMediaReference(value)) return value;
  return getMediaAssetUrl(value.slice(MEDIA_REFERENCE_PREFIX.length));
}

class ServiceCategoryCreator extends HTMLElement {
  connectedCallback() {
    if (this.dataset.initialized === "true") return;
    this.dataset.initialized = "true";
    this.activeRecord = null;
    this.handleEdit = event => this.openForm(event.detail?.record || null);
    document.addEventListener("service-category-edit", this.handleEdit);
    this.render();
    this.openForm(null);
  }

  disconnectedCallback() {
    document.removeEventListener("service-category-edit", this.handleEdit);
  }

  render() {
    this.innerHTML = `
      <large-card class="service-category-creator">
        <h2 class="service-category-creator__title">Category Creator</h2>
        <div class="service-category-creator__status" role="status" aria-live="polite"></div>
        <section class="service-category-creator__form-region"></section>
      </large-card>
    `;
    this.status = this.querySelector(".service-category-creator__status");
    this.formRegion = this.querySelector(".service-category-creator__form-region");
  }

  async openForm(record = null) {
    this.activeRecord = record;
    this.formRegion.hidden = false;
    this.formRegion.innerHTML = `
      <form class="service-category-creator__form">
        <input class="medium-input" name="name" type="text" maxlength="180" placeholder="Name" autocomplete="off" required>
        <input class="medium-input" name="slug" type="text" maxlength="180" placeholder="Slug (e.g. tv-repair)" pattern="[a-z0-9]+(-[a-z0-9]+)*" autocomplete="off" required>
        <textarea class="medium-input service-category-creator__textarea" name="description" placeholder="Description" rows="4"></textarea>
        <div class="service-category-creator__media-field">
          <label>Icon</label>
          <media-upload embedded accept="image/*,.svg,.ico" placeholder="Icon URL"></media-upload>
          <input type="hidden" name="icon">
        </div>
        <div class="service-category-creator__media-field">
          <label>Image</label>
          <media-upload embedded accept="image/*" placeholder="Image URL"></media-upload>
          <input type="hidden" name="image_path">
        </div>
        <rbv-editor data-managed-save data-target-type="component" data-target-key="service-category-creator"></rbv-editor>
        <div class="service-category-creator__actions"></div>
      </form>
    `;

    const form = this.formRegion.querySelector("form");
    const rbv = form.querySelector("rbv-editor");
    const mediaFields = [
      { uploader: form.querySelectorAll("media-upload")[0], input: form.elements.icon, value: record?.icon || "" },
      { uploader: form.querySelectorAll("media-upload")[1], input: form.elements.image_path, value: record?.image_path || "" }
    ];

    if (record) {
      rbv.dataset.table = "service_categories";
      rbv.dataset.rowId = record.id;
    }

    form.elements.name.value = record?.name || "";
    form.elements.slug.value = record?.slug || "";
    window.SlugGenerator.bind({ nameField: form.elements.name, slugField: form.elements.slug });
    form.elements.description.value = record?.description || "";

    // Render the small action buttons before asynchronous media URL resolution.
    const actions = form.querySelector(".service-category-creator__actions");
    actions.append(
      this.makeButton("Save", "medium-button service-category-creator__small-button", () => this.submitForm(form, rbv)),
      this.makeButton("Cancel", "medium-button service-category-creator__small-button", () => this.openForm(null)),
      this.makeButton("Delete", "medium-button service-category-creator__small-button", () => this.deleteRecord())
    );
    actions.lastElementChild.disabled = !record;

    for (const field of mediaFields) {
      field.input.value = field.value;
      field.uploader.addEventListener("media-url-changed", event => {
        field.input.value = event.detail.url || "";
      });
      field.uploader.addEventListener("media-uploaded", event => {
        field.input.value = storedMediaValue(event.detail.asset.id);
      });
      displayMediaUrl(field.value).then(url => {
        if (!url || !field.uploader.isConnected) return;
        const urlInput = field.uploader.querySelector(".media-library-upload__url");
        if (urlInput) urlInput.value = url;
      }).catch(() => {});
    }

    try {
      await rbv.ready;
    } catch (error) {
      this.setStatus(error?.message || "RBV could not be loaded.", true);
      actions.querySelectorAll("button").forEach(button => button.disabled = true);
    }
  }

  async submitForm(form, rbv) {
    if (!form.reportValidity()) return;
    const buttons = form.querySelectorAll("button");
    buttons.forEach(button => button.disabled = true);
    const mode = this.activeRecord ? "update" : "create";
    this.setStatus("Saving...");

    try {
      await rbv.ready;
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!authData.user) throw new Error("Please sign in before managing service categories.");

      const values = {
        name: form.elements.name.value.trim(),
        slug: form.elements.slug.value.trim().toLowerCase(),
        description: form.elements.description.value.trim(),
        icon: form.elements.icon.value.trim(),
        image_path: form.elements.image_path.value.trim() || null,
        visible_role_ids: rbv.getSelectedRoleIds(),
        updated_by: authData.user.id
      };

      if (mode === "create") {
        values.created_by = authData.user.id;
        const { error } = await supabase.from("service_categories").insert(values);
        if (error) throw error;
      } else {
        values.created_by = this.activeRecord.created_by;
        const { error } = await supabase.from("service_categories").update(values).eq("id", this.activeRecord.id);
        if (error) throw error;
      }

      await this.openForm(null);
      this.setStatus("Service category saved successfully.");
      document.dispatchEvent(new CustomEvent("service-categories-changed"));
    } catch (error) {
      this.setStatus(error?.message || "Service category could not be saved.", true);
      buttons.forEach(button => button.disabled = false);
    }
  }

  async deleteRecord() {
    if (!this.activeRecord) return;
    if (!window.confirm("Delete this service category? This action cannot be undone.")) return;
    this.setStatus("Deleting...");
    try {
      const { error } = await supabase.from("service_categories").delete().eq("id", this.activeRecord.id);
      if (error) throw error;
      await this.openForm(null);
      this.setStatus("Service category deleted successfully.");
      document.dispatchEvent(new CustomEvent("service-categories-changed"));
    } catch (error) {
      this.setStatus(error?.message || "Service category could not be deleted.", true);
    }
  }

  makeButton(label, className, onClick) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = className;
    button.setAttribute("aria-label", label);
    button.textContent = label;
    button.addEventListener("click", onClick);
    return button;
  }

  setStatus(message, isError = false) {
    if (!this.status) return;
    this.status.textContent = message;
    this.status.dataset.state = isError ? "error" : "";
  }
}

if (!customElements.get("service-category-creator")) {
  customElements.define("service-category-creator", ServiceCategoryCreator);
}
