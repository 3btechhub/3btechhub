import { supabase } from "../supabase-client.js";
import "../cards/large-card.js";

const SERVICES_ROW_ID = 1;

/* Home page Services heading viewer. Kept independent from the Services page viewer. */
class HomeServicesViewer extends HTMLElement {
  connectedCallback() {
    if (this.dataset.initialized === "true") return;
    this.dataset.initialized = "true";
    this.loadHeading().catch(error => {
      console.error("Home Services heading could not be loaded.", error);
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
    card.className = "home-services-viewer-card";

    const title = document.createElement("h2");
    title.className = "heading text-center";
    title.textContent = heading;

    card.appendChild(title);
    this.replaceChildren(card);
  }
}

if (!customElements.get("home-services-viewer")) {
  customElements.define("home-services-viewer", HomeServicesViewer);
}
