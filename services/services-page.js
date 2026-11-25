import "./services-viewer.js";
import { supabase } from "../supabase-client.js";

class ServicesPage extends HTMLElement {
  connectedCallback() {
    if (this.dataset.initialized === "true") return;
    this.dataset.initialized = "true";
    const section = document.createElement("services-section");
    section.setAttribute("data-show-description", "");
    this.replaceChildren(section);
  }
}
if (!customElements.get("services-page")) customElements.define("services-page", ServicesPage);
