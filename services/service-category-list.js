import { supabase } from "../supabase-client.js";
import { registerCrudConfig } from "../crud/crud-config.js";
import { CrudCore } from "../crud/crud-core.js";
import { getMediaAssetUrl } from "../media/media.js";

const LIST_CONFIG = registerCrudConfig({
  id: "service-category-list",
  table: "service_categories",
  primaryKey: "id",
  select: "id, name, slug, description, icon, image_path, visible_role_ids, created_at, updated_at",
  orderBy: { column: "name", ascending: true },
  actions: ["read"],
  fields: [
    { name: "name", label: "Name" },
    { name: "slug", label: "Slug" },
    { name: "description", label: "Description" },
    { name: "icon", label: "Icon" },
    { name: "image_path", label: "Image" },
    { name: "visible_role_ids", label: "RBV" }
  ]
});

const MEDIA_REFERENCE_PREFIX = "media:";

async function resolveMediaUrl(value) {
  if (!value) return "";
  if (!String(value).startsWith(MEDIA_REFERENCE_PREFIX)) return value;
  return getMediaAssetUrl(value.slice(MEDIA_REFERENCE_PREFIX.length));
}

class ServiceCategoryList extends HTMLElement {
  connectedCallback() {
    if (this.dataset.initialized === "true") return;
    this.dataset.initialized = "true";
    this.core = new CrudCore(supabase, LIST_CONFIG);
    this.handleRefresh = () => this.loadRecords();
    document.addEventListener("service-categories-changed", this.handleRefresh);
    this.render();
    this.loadRecords();
  }

  disconnectedCallback() {
    document.removeEventListener("service-categories-changed", this.handleRefresh);
  }

  render() {
    this.innerHTML = `
      <section class="service-category-list">
        <h2 class="service-category-list__title">Service Category List</h2>
        <p class="service-category-list__status" role="status" aria-live="polite"></p>
        <div class="service-category-list__items"></div>
      </section>
    `;
    this.status = this.querySelector(".service-category-list__status");
    this.items = this.querySelector(".service-category-list__items");
  }

  async loadRecords() {
    this.setStatus("Loading...");
    try {
      const records = await this.core.read();
      await this.renderRecords(records);
      this.setStatus(records.length ? "" : "No service categories found.");
    } catch (error) {
      this.items.replaceChildren();
      this.setStatus(error?.message || "Service categories could not be loaded.", true);
    }
  }

  async renderRecords(records) {
    this.items.replaceChildren();
    for (const record of records) {
      const card = document.createElement("article");
      card.className = "medium-card service-category-list__card";

      if (record.icon) {
        const iconUrl = await resolveMediaUrl(record.icon).catch(() => "");
        if (iconUrl) {
          const icon = document.createElement("img");
          icon.className = "service-category-list__icon";
          icon.src = iconUrl;
          icon.alt = record.name + " icon";
          icon.loading = "lazy";
          icon.addEventListener("error", () => icon.hidden = true, { once: true });
          card.append(icon);
        }
      }

      const heading = document.createElement("h3");
      heading.className = "medium-card__heading";
      heading.textContent = record.name || "Untitled category";
      card.append(heading);

      const slug = document.createElement("p");
      slug.className = "medium-card__meta";
      slug.textContent = record.slug || "";
      if (slug.textContent) card.append(slug);

      if (record.description) {
        const description = document.createElement("p");
        description.className = "service-category-list__description";
        description.textContent = record.description;
        card.append(description);
      }

      if (record.image_path) {
        const imageUrl = await resolveMediaUrl(record.image_path).catch(() => "");
        if (imageUrl) {
          const image = document.createElement("img");
          image.className = "service-category-list__image";
          image.src = imageUrl;
          image.alt = record.name || "Service category";
          image.loading = "lazy";
          image.addEventListener("error", () => image.hidden = true, { once: true });
          card.append(image);
        }
      }

      const actions = document.createElement("div");
      actions.className = "medium-card__actions";
      const edit = document.createElement("button");
      edit.type = "button";
      edit.className = "medium-button";
      edit.textContent = "Edit";
      edit.addEventListener("click", () => {
        document.dispatchEvent(new CustomEvent("service-category-edit", {
          detail: { record },
          bubbles: false
        }));
      });
      actions.append(edit);
      card.append(actions);
      this.items.append(card);
    }
  }

  setStatus(message, isError = false) {
    this.status.textContent = message;
    this.status.dataset.state = isError ? "error" : "";
  }
}

if (!customElements.get("service-category-list")) {
  customElements.define("service-category-list", ServiceCategoryList);
}
