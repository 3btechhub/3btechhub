(() => {
  "use strict";

  if (customElements.get("section-card")) return;

  class SectionCard extends HTMLElement {
    static get observedAttributes() {
      return ["title", "description"];
    }

    connectedCallback() {
      if (this.dataset.initialized === "true") return;
      this.dataset.initialized = "true";

      this.section = document.createElement("section");
      this.section.className = "section-card";

      this.heading = document.createElement("h2");
      this.heading.className = "section-card__title";

      this.description = document.createElement("p");
      this.description.className = "section-card__description";

      this.content = document.createElement("div");
      this.content.className = "section-card__content";

      while (this.firstChild) this.content.appendChild(this.firstChild);

      this.section.append(this.heading, this.description, this.content);
      this.appendChild(this.section);
      this.updateText();
    }

    attributeChangedCallback() {
      if (this.section) this.updateText();
    }

    updateText() {
      const title = this.getAttribute("title") || "";
      const description = this.getAttribute("description") || "";

      this.heading.textContent = title;
      this.heading.hidden = !title;

      this.description.textContent = description;
      this.description.hidden = !description;
    }
  }

  customElements.define("section-card", SectionCard);
})();
