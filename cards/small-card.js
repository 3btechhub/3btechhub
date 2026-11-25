/*
 * SMALL CARD — Shared card surface component.
 *
 * Mirrors Large Card structure and surface treatment.
 * Only the overall size and internal spacing are reduced.
 * Standard CSS owns all visual surface properties.
 */
class SmallCard extends HTMLElement {
  connectedCallback() {
    if (this.dataset.smallCardReady === "true") return;
    this.dataset.smallCardReady = "true";
  }
}

if (!customElements.get("small-card")) {
  customElements.define("small-card", SmallCard);
}
