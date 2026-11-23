(() => {
  "use strict";

  if (customElements.get("section-card")) return;

  class SectionCard extends HTMLElement {
    connectedCallback() {
      if (this.dataset.initialized === "true") return;
      this.dataset.initialized = "true";

      const section = document.createElement("section");
      section.className = "section-card";

      const title = this.getAttribute("title");
      const description = this.getAttribute("description");

      if (title) {
        const heading = document.createElement("h2");
        heading.className = "section-card__title";
        heading.textContent = title;
        section.appendChild(heading);
      }

      if (description) {
        const summary = document.createElement("p");
        summary.className = "section-card__description";
        summary.textContent = description;
        section.appendChild(summary);
      }

      const content = document.createElement("div");
      content.className = "section-card__content";

      while (this.firstChild) content.appendChild(this.firstChild);
      section.appendChild(content);
      this.appendChild(section);
    }
  }

  customElements.define("section-card", SectionCard);
})();
