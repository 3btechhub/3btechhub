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

/* Home page category cards. Selecting a card opens Services on that category. */
class ServiceCategoryCardHome extends HTMLElement {
  connectedCallback() {
    if (this.dataset.initialized === "true") return;
    this.dataset.initialized = "true";
    this.handleCategoryChange = () => this.loadCategories();
    document.addEventListener("service-categories-changed", this.handleCategoryChange);
    this.loadCategories().catch(error => {
      console.error("Home service category cards could not be loaded.", error);
      this.replaceChildren();
    });
  }

  disconnectedCallback() {
    document.removeEventListener("service-categories-changed", this.handleCategoryChange);
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
    const servicesUrl = new URL("./", import.meta.url);

    for (const category of categories) {
      const url = new URL(servicesUrl.href);
      url.searchParams.set("category", category.slug || String(category.id));

      const link = document.createElement("a");
      link.className = "service-category-card-home__link";
      link.href = url.href;
      link.setAttribute("aria-label", `View ${category.name || "service"} category`);

      const card = document.createElement("small-card");
      card.className = "service-category-card-home__card";

      const mediaValue = category.image_path || category.icon;
      if (mediaValue) {
        try {
          const mediaUrl = await resolveCategoryMedia(mediaValue);
          if (mediaUrl) {
            const image = document.createElement("img");
            image.className = "service-category-card-home__media";
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
      title.className = "service-category-card-home__name";
      title.textContent = category.name || "";
      card.append(title);
      link.append(card);
      fragment.append(link);
    }

    this.replaceChildren(fragment);
    this.hidden = categories.length === 0;
  }
}

if (!customElements.get("service-category-card-home")) {
  customElements.define("service-category-card-home", ServiceCategoryCardHome);
}
