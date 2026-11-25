import { supabase } from "../supabase-client.js";
import { registerCrudConfig } from "../crud/crud-config.js";
import { CrudCore } from "../crud/crud-core.js";
import { getMediaAssetUrl } from "../media/media.js";
import { getActiveRoles } from "../visibility/rbv.js";

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
      <large-card class="service-category-list">
        <h2 class="service-category-list__title">Category List</h2>
        <p class="service-category-list__status" role="status" aria-live="polite"></p>
        <div class="service-category-list__items"></div>
      </large-card>
    `;
    this.status = this.querySelector(".service-category-list__status");
    this.items = this.querySelector(".service-category-list__items");
  }

  async loadRecords() {
    this.setStatus("Loading...");
    try {
      const [records, roles] = await Promise.all([
        this.core.read(),
        getActiveRoles()
      ]);
      this.rolesById = new Map(roles.map(role => [String(role.id), role]));
      await this.renderRecords(records);
      this.setStatus(records.length ? "" : "No service categories found.");
    } catch (error) {
      this.items.replaceChildren();
      this.setStatus(error?.message || "Service categories could not be loaded.", true);
    }
  }

  openRecord(record) {
    document.dispatchEvent(new CustomEvent("service-category-edit", {
      detail: { record },
      bubbles: false
    }));
  }

  async createMediaElement(record) {
    const mediaValue = record.image_path || record.icon;
    const mediaType = record.image_path ? "image" : "icon";
    if (mediaValue) {
      const mediaUrl = await resolveMediaUrl(mediaValue).catch(() => "");
      if (mediaUrl) {
        const image = document.createElement("img");
        image.className = "service-category-list__avatar";
        image.src = mediaUrl;
        image.alt = record.name ? `${record.name} ${mediaType}` : `Category ${mediaType}`;
        image.loading = "lazy";
        image.addEventListener("error", () => {
          image.replaceWith(this.createBlankAvatar());
        }, { once: true });
        return image;
      }
    }
    return this.createBlankAvatar();
  }

  createBlankAvatar() {
    const avatar = document.createElement("span");
    avatar.className = "service-category-list__avatar service-category-list__avatar--blank";
    avatar.setAttribute("aria-label", "No image or icon");
    return avatar;
  }

  createRoleList(record) {
    const list = document.createElement("div");
    list.className = "service-category-list__roles";
    list.setAttribute("aria-label", "Selected RBV roles");

    const selectedIds = Array.isArray(record.visible_role_ids)
      ? record.visible_role_ids
      : [];

    selectedIds.forEach(id => {
      const role = this.rolesById?.get(String(id));
      if (!role) return;
      const item = document.createElement("span");
      item.className = "service-category-list__role";
      item.textContent = role.name;
      list.append(item);
    });

    return list;
  }

  async renderRecords(records) {
    this.items.replaceChildren();
    for (const record of records) {
      const card = document.createElement("article");
      card.className = "medium-card service-category-list__card";
      card.tabIndex = 0;
      card.setAttribute("role", "button");
      card.setAttribute("aria-label", `Edit service category: ${record.name || "Untitled category"}`);
      card.addEventListener("click", () => this.openRecord(record));
      card.addEventListener("keydown", event => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        this.openRecord(record);
      });

      const layout = document.createElement("div");
      layout.className = "service-category-list__layout";

      const details = document.createElement("div");
      details.className = "service-category-list__details";

      const heading = document.createElement("h3");
      heading.className = "medium-card__heading";
      heading.textContent = record.name || "Untitled category";
      details.append(heading);

      const slug = document.createElement("p");
      slug.className = "medium-card__meta";
      slug.textContent = record.slug || "";
      if (slug.textContent) details.append(slug);

      if (record.description) {
        const description = document.createElement("p");
        description.className = "service-category-list__description";
        description.textContent = record.description;
        details.append(description);
      }

      const side = document.createElement("div");
      side.className = "service-category-list__side";
      side.append(await this.createMediaElement(record));

      const rolesHeading = document.createElement("span");
      rolesHeading.className = "service-category-list__roles-heading";
      rolesHeading.textContent = "Selected RBV";
      side.append(rolesHeading, this.createRoleList(record));

      layout.append(details, side);
      card.append(layout);
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
