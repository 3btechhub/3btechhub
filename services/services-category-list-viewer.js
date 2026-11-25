import { supabase } from "../supabase-client.js";
import "../cards/large-card.js";

class ServiceCategoryListViewer extends HTMLElement {
  connectedCallback() {
    if (this.dataset.initialized === "true") return;
    this.dataset.initialized = "true";
    this.addEventListener("click", event => {
      const button = event.target.closest("[data-edit-category]");
      if (!button) return;
      const category = this.categories?.find(item => String(item.id) === button.dataset.editCategory);
      this.dispatchEvent(new CustomEvent("service-category-edit", { bubbles: true, detail: { category } }));
    });
    this.reload = () => this.load();
    window.addEventListener("service-categories-updated", this.reload);
    this.load();
  }
  disconnectedCallback() { window.removeEventListener("service-categories-updated", this.reload); }
  async load() {
    this.innerHTML = '<large-card class="service-category-list-viewer"><h2 class="heading">Service Category List Viewer</h2><p>Loading categories…</p></large-card>';
    try {
      const { data, error } = await supabase.from("services")
        .select("id, name, slug, description, visible_role_ids")
        .order("sort_order", { ascending: true }).order("name");
      if (error) throw error;
      this.categories = data || [];
      this.render();
    } catch (error) {
      this.innerHTML = '<large-card class="service-category-list-viewer"><h2 class="heading">Service Category List Viewer</h2><p role="alert"></p></large-card>';
      this.querySelector('[role="alert"]').textContent = error?.message || "Categories could not be loaded.";
    }
  }
  render() {
    const cards = this.categories.map(item => `
      <article class="medium-card service-category-list-viewer__item">
        <h3 class="medium-card__heading">${this.escape(item.name)}</h3>
        <p class="medium-card__meta">/${this.escape(item.slug)}</p>
        <p>${this.escape(item.description || "")}</p>
        <button class="medium-button" type="button" data-edit-category="${this.escape(item.id)}">Edit</button>
      </article>`).join("");
    this.innerHTML = `<large-card class="service-category-list-viewer"><h2 class="heading">Service Category List Viewer</h2><div class="service-category-list-viewer__grid">${cards || "<p>No service categories yet.</p>"}</div></large-card>`;
  }
  escape(value) { return String(value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
}
if (!customElements.get("service-category-list-viewer")) customElements.define("service-category-list-viewer", ServiceCategoryListViewer);
