import "./large-card.js";

/*
 * Our Services — Service Category viewer.
 * Category records are supplied by the data layer through the categories property.
 * Category visibility must be filtered by the RBV data layer before assignment.
 */
class OurServices extends HTMLElement {
  constructor() {
    super();
    this._categories = [];
  }

  set categories(value) {
    this._categories = Array.isArray(value) ? value : [];
    this.render();
  }

  get categories() {
    return this._categories;
  }

  connectedCallback() {
    this.render();
  }

  render() {
    this.replaceChildren();
    if (!this._categories.length) {
      this.hidden = true;
      return;
    }

    this.hidden = false;
    const heading = document.createElement("h2");
    heading.className = "heading our-services__heading";
    heading.textContent = "Our Services";

    const grid = document.createElement("div");
    grid.className = "our-services__grid";

    for (const category of this._categories) {
      if (!category || category.visibility === false) continue;

      const card = document.createElement("large-card");
      card.className = "our-services__item";

      if (category.image) {
        const image = document.createElement("img");
        image.className = "our-services__image";
        image.src = category.image;
        image.alt = category.name || "";
        image.loading = "lazy";
        card.append(image);
      } else if (category.icon) {
        const icon = document.createElement("span");
        icon.className = "our-services__icon";
        icon.textContent = category.icon;
        icon.setAttribute("aria-hidden", "true");
        card.append(icon);
      }

      const name = document.createElement("h3");
      name.className = "our-services__name";
      name.textContent = category.name || "";
      card.append(name);

      if (category.description) {
        const description = document.createElement("p");
        description.className = "our-services__description";
        description.textContent = category.description;
        card.append(description);
      }

      grid.append(card);
    }

    if (!grid.childElementCount) {
      this.hidden = true;
      return;
    }

    this.append(heading, grid);
  }
}

if (!customElements.get("our-services")) {
  customElements.define("our-services", OurServices);
}

export { OurServices };
