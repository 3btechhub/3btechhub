import "./services-viewer.js";

class ServicesPage extends HTMLElement {
  connectedCallback() {
    if (this.dataset.initialized === "true") return;
    this.dataset.initialized = "true";

    const section = document.createElement("services-section");
    this.replaceChildren(section);
  }
}

if (!customElements.get("services-page")) {
  customElements.define("services-page", ServicesPage);
}
