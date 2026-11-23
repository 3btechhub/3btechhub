(() => {
  "use strict";

  if (customElements.get("item-card")) return;

  class ItemCard extends HTMLElement {
    connectedCallback() {
      if (this.dataset.initialized === "true") return;
      this.dataset.initialized = "true";

      const article = document.createElement("article");
      article.className = "item-card";

      const title = this.getAttribute("title");
      const description = this.getAttribute("description");

      if (title) {
        const heading = document.createElement("h3");
        heading.className = "item-card__title";
        heading.textContent = title;
        article.appendChild(heading);
      }

      if (description) {
        const summary = document.createElement("p");
        summary.className = "item-card__description";
        summary.textContent = description;
        article.appendChild(summary);
      }

      const content = document.createElement("div");
      content.className = "item-card__content";
      while (this.firstChild) content.appendChild(this.firstChild);

      if (content.childNodes.length) article.appendChild(content);
      this.appendChild(article);
    }
  }

  customElements.define("item-card", ItemCard);
})();
