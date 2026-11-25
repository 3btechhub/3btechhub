import { supabase } from "../supabase-client.js";

const CATEGORY_FIELDS = "id, name, slug";

function categoryKey(category) {
  return category.slug || String(category.id);
}

/* Services page tabs are generated from the visible service_categories rows. */
class ServiceCategoryTabsPage extends HTMLElement {
  connectedCallback() {
    if (this.dataset.initialized === "true") return;
    this.dataset.initialized = "true";
    this.handleCategoryChange = () => this.loadCategories();
    this.handlePopState = () => this.activateFromLocation();
    document.addEventListener("service-categories-changed", this.handleCategoryChange);
    window.addEventListener("popstate", this.handlePopState);

    this.renderShell();
    this.loadCategories().catch(error => {
      console.error("Services page category tabs could not be loaded.", error);
      this.showMessage("Categories could not be loaded.");
    });

    this.realtimeChannel = supabase
      .channel("service-category-tabs-page")
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "service_categories"
      }, () => this.loadCategories())
      .subscribe();
  }

  disconnectedCallback() {
    document.removeEventListener("service-categories-changed", this.handleCategoryChange);
    window.removeEventListener("popstate", this.handlePopState);
    if (this.realtimeChannel) {
      supabase.removeChannel(this.realtimeChannel);
      this.realtimeChannel = null;
    }
  }

  renderShell() {
    this.innerHTML = `
      <div class="service-category-tabs-page__tabs" role="tablist" aria-label="Service categories"></div>
      <div class="service-category-tabs-page__status" role="status" aria-live="polite"></div>
    `;
    this.tabs = this.querySelector(".service-category-tabs-page__tabs");
    this.status = this.querySelector(".service-category-tabs-page__status");
  }

  async loadCategories() {
    const { data, error } = await supabase
      .from("service_categories")
      .select(CATEGORY_FIELDS)
      .order("name", { ascending: true });

    if (error) throw error;

    this.categories = data || [];
    if (!this.categories.length) {
      this.tabs.replaceChildren();
      this.showMessage("");
      this.dispatchSelection(null);
      return;
    }

    const requestedKey = new URL(window.location.href).searchParams.get("category");
    const selected = this.categories.find(category => categoryKey(category) === requestedKey)
      || this.categories[0];

    this.renderTabs(selected);
    this.showMessage("");
    this.dispatchSelection(selected);
  }

  renderTabs(selectedCategory) {
    const fragment = document.createDocumentFragment();

    for (const category of this.categories) {
      const key = categoryKey(category);
      const active = key === categoryKey(selectedCategory);
      const button = document.createElement("button");
      button.type = "button";
      button.className = "service-category-tabs-page__tab";
      button.id = `service-category-tab-${CSS.escape(key)}`;
      button.setAttribute("role", "tab");
      button.setAttribute("aria-selected", String(active));
      button.setAttribute("aria-controls", "service-category-content");
      button.tabIndex = active ? 0 : -1;
      button.textContent = category.name || "Untitled category";
      button.addEventListener("click", () => this.selectCategory(category));
      fragment.append(button);
    }

    this.tabs.replaceChildren(fragment);
  }

  selectCategory(category) {
    this.renderTabs(category);
    const url = new URL(window.location.href);
    url.searchParams.set("category", categoryKey(category));
    window.history.replaceState({}, "", url);
    this.dispatchSelection(category);
  }

  activateFromLocation() {
    if (!this.categories?.length) return;
    const key = new URL(window.location.href).searchParams.get("category");
    const selected = this.categories.find(category => categoryKey(category) === key)
      || this.categories[0];
    this.renderTabs(selected);
    this.dispatchSelection(selected);
  }

  dispatchSelection(category) {
    document.dispatchEvent(new CustomEvent("service-category-selected", {
      detail: { category },
      bubbles: false
    }));
  }

  showMessage(message) {
    this.status.textContent = message;
    this.status.hidden = !message;
  }
}

if (!customElements.get("service-category-tabs-page")) {
  customElements.define("service-category-tabs-page", ServiceCategoryTabsPage);
}
