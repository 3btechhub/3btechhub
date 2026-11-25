import { supabase } from "../supabase-client.js";
import "../cards/large-card.js";

const SERVICES_ROW_ID = 1;

/* Home page Services heading viewer. Independent from the Services page viewer. */
class ServicesHomeViewer extends HTMLElement {
  connectedCallback() {
    if (this.dataset.initialized === "true") return;
    this.dataset.initialized = "true";
    this.loadHeading().catch(error => {
      console.error("Home page Services heading could not be loaded.", error);
      this.replaceChildren();
    });
  }

  async loadHeading() {
    const { data, error } = await supabase
      .from("services")
      .select("heading")
      .eq("id", SERVICES_ROW_ID)
      .single();

    if (error) throw error;

    const heading = data?.heading?.trim();
    if (!heading) {
      this.replaceChildren();
      return;
    }

    const card = document.createElement("large-card");
    card.className = "services-home-viewer-card";

    const link = document.createElement("a");
    link.className = "services-home-viewer-card__link";
    link.href = "../services/";
    link.setAttribute("aria-label", "Open Services");

    const title = document.createElement("h1");
    title.className = "heading text-center";
    title.textContent = heading;

    link.appendChild(title);
    card.appendChild(link);
    this.replaceChildren(card);
  }
}

if (!customElements.get("services-home-viewer")) {
  customElements.define("services-home-viewer", ServicesHomeViewer);
}
