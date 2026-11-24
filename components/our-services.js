import { supabase } from "./supabase-client.js";
import "./large-card.js";

/*
 * Our Services — Service Category viewer.
 * The public.our_services SELECT policies apply RBV per category in Supabase.
 * Only rows allowed for the current visitor/session are returned.
 */
class OurServices extends HTMLElement {
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
        .from("our_services")
        .select("id, name, slug, icon, image_path, sort_order")
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true });

      if (error) throw error;

      const categories = await Promise.all((data || []).map(async category => {
        let image = category.image_path || "";
        if (image && !/^https?:\/\//i.test(image)) {
          const { data: signed, error: imageError } = await supabase.storage
            .from("site-media")
            .createSignedUrl(image, 3600);
          if (imageError) {
            console.warn("Service category image could not be loaded.", imageError);
            image = "";
          } else {
            image = signed?.signedUrl || "";
          }
        }
        return { ...category, image };
      }));

      this._categories = categories;
      this.render();
    } catch (error) {
      console.error("Our Services could not be loaded.", error);
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

    const heading = document.createElement("h2");
    heading.className = "heading our-services__heading";
    heading.textContent = "Our Services";

    const grid = document.createElement("div");
    grid.className = "our-services__grid";

    for (const category of this._categories) {
      const card = document.createElement("large-card");
      card.className = "our-services__item";

      if (category.image) {
        const image = document.createElement("img");
        image.className = "our-services__image";
        image.src = category.image;
        image.alt = category.name || "";
        image.loading = "lazy";
        card.append(image);
      } else if (category.icon) {
        const icon = document.createElement("span");
        icon.className = "our-services__icon";
        icon.textContent = category.icon;
        icon.setAttribute("aria-hidden", "true");
        card.append(icon);
      }

      const name = document.createElement("h3");
      name.className = "our-services__name";
      name.textContent = category.name || "";
      card.append(name);

      grid.append(card);
    }

    this.append(heading, grid);
    this.hidden = false;
  }
}

if (!customElements.get("our-services")) {
  customElements.define("our-services", OurServices);
}

export { OurServices };
