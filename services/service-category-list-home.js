import { supabase } from "../supabase-client.js";
import { getMediaAssetUrl } from "../media/media.js";
import "../cards/small-card.js";

const CATEGORY_FIELDS = "id, name, slug, icon, image_path";
const MEDIA_REFERENCE_PREFIX = "media:";

async function resolveCategoryMedia(value) {
  if (!value) return "";
  const source = String(value);
  if (!source.startsWith(MEDIA_REFERENCE_PREFIX)) return source;
  return getMediaAssetUrl(source.slice(MEDIA_REFERENCE_PREFIX.length));
}

/* Home page service categories. Rendered as mini cards inside the Services card. */
class ServiceCategoryListHome extends HTMLElement {
  connectedCallback() {
    if (this.dataset.initialized === "true") return;
    this.dataset.initialized = "true";
    this.loadCategories().catch(error => {
      console.error("Home service categories could not be loaded.", error);
      this.replaceChildren();
    });
  }

  async loadCategories() {
    const { data, error } = await supabase
      .from("service_categories")
      .select(CATEGORY_FIELDS)
      .order("name", { ascending: true });

    if (error) throw error;
    await this.renderCategories(data || []);
  }

  async renderCategories(categories) {
    const fragment = document.createDocumentFragment();

    for (const category of categories) {
      const card = document.createElement("small-card");
      card.className = "service-category-list-home__card";

      const mediaValue = category.icon || category.image_path;
      if (mediaValue) {
        try {
          const mediaUrl = await resolveCategoryMedia(mediaValue);
          if (mediaUrl) {
            const image = document.createElement("img");
            image.className = "service-category-list-home__media";
            image.src = mediaUrl;
            image.alt = "";
            image.loading = "lazy";
            image.addEventListener("error", () => image.remove(), { once: true });
            card.append(image);
          }
        } catch (error) {
          console.warn("A service category image could not be loaded.", error);
        }
      }

      const title = document.createElement("h3");
      title.className = "service-category-list-home__name";
      title.textContent = category.name || "";
      card.append(title);
      fragment.append(card);
    }

    this.replaceChildren(fragment);
    this.hidden = categories.length === 0;
  }
}

if (!customElements.get("service-category-list-home")) {
  customElements.define("service-category-list-home", ServiceCategoryListHome);
}
