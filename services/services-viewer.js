import { supabase } from "../supabase-client.js";
import "../cards/large-card.js";
import "../cards/small-card.js";

/*
 * Services — Service Category viewer.
 * The public.services SELECT policies apply RBV per category in Supabase.
 * Only rows allowed for the current visitor/session are returned.
 */
class Services extends HTMLElement {
  constructor() {
    super();
    this._categories = [];
    this._loading = false;
  }

  connectedCallback() {
    if (this.dataset.initialized === "true") return;
    this.dataset.initialized = "true";
    this.loadCategories();
  }

  async loadCategories() {
    if (this._loading) return;
    this._loading = true;
    this.hidden = true;

    try {
      const { data, error } = await supabase
        .from("services")
        .select("id, name, slug, description, icon, image_path, sort_order")
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true });

      if (error) throw error;

      const categories = await Promise.all((data || []).map(async category => {
        let image = category.image_path || "";
        if (image && !/^https?:\/\//i.test(image)) {
          const { data: publicAsset } = supabase.storage
            .from("service-images")
            .getPublicUrl(image);
          image = publicAsset?.publicUrl || "";
        }
        return { ...category, image, iconUrl: category.icon || "" };
      }));

      this._categories = categories;
      this.render();
    } catch (error) {
      console.error("Services could not be loaded.", error);
      this.replaceChildren();
      this.hidden = true;
    } finally {
      this._loading = false;
    }
  }

  render() {
    this.replaceChildren();
    if (!this._categories.length) {
      this.hidden = true;
      return;
    }

    const surface = document.createElement("large-card");
    surface.className = "services-section__surface";

    const heading = document.createElement("h2");
    heading.className = "heading services-section__heading";
    heading.textContent = "Services";

    const grid = document.createElement("div");
    grid.className = "services-section__grid";

    for (const category of this._categories) {
      const card = document.createElement("mini-card");
      card.className = "services-section__item";

      if (category.image) {
        const image = document.createElement("img");
        image.className = "services-section__image";
        image.src = category.image;
        image.alt = category.name || "";
        image.loading = "lazy";
        card.append(image);
      }

      if (category.iconUrl) {
        if (/^https?:\/\//i.test(category.iconUrl)) {
          const icon = document.createElement("img");
          icon.className = "services-section__icon services-section__icon-image";
          icon.src = category.iconUrl;
          icon.alt = "";
          icon.loading = "lazy";
          card.append(icon);
        } else {
          const icon = document.createElement("span");
          icon.className = "services-section__icon";
          icon.textContent = category.iconUrl;
          icon.setAttribute("aria-hidden", "true");
          card.append(icon);
        }
      }

      const name = document.createElement("h3");
      name.className = "services-section__name";
      name.textContent = category.name || "";
      card.append(name);

      if (category.description) {
        const description = document.createElement("p");
        description.className = "services-section__description";
        description.textContent = category.description;
        card.append(description);
      }

      grid.append(card);
    }

    surface.append(heading, grid);
    this.append(surface);
    this.hidden = false;
  }
}

if (!customElements.get("services-section")) {
  customElements.define("services-section", Services);
}

export { Services };
