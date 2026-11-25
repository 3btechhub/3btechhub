import { supabase } from "../supabase-client.js";
import "../cards/large-card.js";
import "../cards/small-card.js";

class Services extends HTMLElement {
  connectedCallback() {
    if (this.dataset.initialized === "true") return;
    this.dataset.initialized = "true";
    this.loadCategories();
    window.addEventListener("service-description-updated", event => this.updateDescription(event.detail?.description));
  }
  async loadCategories() {
    this.hidden = true;
    try {
      const { data, error } = await supabase.from("services")
        .select("id, name, slug, description, icon, image_path, sort_order")
        .order("sort_order", { ascending:true }).order("name", { ascending:true });
      if (error) throw error;
      this.categories = await Promise.all((data || []).map(async item => {
        let image = item.image_path || "";
        if (image && !/^https?:\/\//i.test(image)) {
          const { data: asset } = supabase.storage.from("service-images").getPublicUrl(image);
          image = asset?.publicUrl || "";
        }
        return { ...item, image };
      }));
      if (this.hasAttribute("data-show-description")) {
        const { data: content, error: contentError } = await supabase.from("service_content").select("description").eq("id",1).maybeSingle();
        if (contentError) throw contentError;
        this.description = content?.description || "";
      }
      this.render();
    } catch (error) { console.error("Services could not be loaded.", error); this.replaceChildren(); this.hidden = true; }
  }
  updateDescription(value) {
    this.description = value || "";
    const target = this.querySelector(".services-section__description-intro");
    if (target) { target.textContent = this.description; target.hidden = !this.description; }
  }
  render() {
    this.replaceChildren();
    if (!this.categories?.length) { this.hidden = true; return; }
    const surface = document.createElement("large-card");
    surface.className = "services-section__surface";
    if (this.hasAttribute("data-link-to-services")) {
      surface.classList.add("services-section__surface--linked");
      surface.setAttribute("role","link"); surface.tabIndex = 0;
      surface.setAttribute("aria-label","Open Services page");
      const open = () => { window.location.href = new URL("./index.html", import.meta.url).href; };
      surface.addEventListener("click", open);
      surface.addEventListener("keydown", event => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); open(); } });
    }
    const heading = document.createElement("h2");
    heading.className = "heading services-section__heading"; heading.textContent = "Services";
    surface.append(heading);
    if (this.hasAttribute("data-show-description")) {
      const description = document.createElement("p");
      description.className = "services-section__description-intro";
      description.textContent = this.description || "";
      description.hidden = !this.description;
      surface.append(description);
    }
    const grid = document.createElement("div"); grid.className = "services-section__grid";
    for (const item of this.categories) {
      const card = document.createElement("mini-card"); card.className = "services-section__item";
      if (item.image) { const img = document.createElement("img"); img.className = "services-section__image"; img.src = item.image; img.alt = item.name || ""; img.loading = "lazy"; card.append(img); }
      if (item.icon) {
        if (/^https?:\/\//i.test(item.icon)) { const icon = document.createElement("img"); icon.className = "services-section__icon services-section__icon-image"; icon.src = item.icon; icon.alt = ""; icon.loading = "lazy"; card.append(icon); }
        else { const icon = document.createElement("span"); icon.className = "services-section__icon"; icon.textContent = item.icon; icon.setAttribute("aria-hidden","true"); card.append(icon); }
      }
      const name = document.createElement("h3"); name.className = "services-section__name"; name.textContent = item.name || ""; card.append(name);
      if (item.description) { const desc = document.createElement("p"); desc.className = "services-section__description"; desc.textContent = item.description; card.append(desc); }
      grid.append(card);
    }
    surface.append(grid); this.append(surface); this.hidden = false;
  }
}
if (!customElements.get("services-section")) customElements.define("services-section", Services);
export { Services };
