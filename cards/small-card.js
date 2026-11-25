/*
 * MINI CARD — Square shared card surface component
 *
 * Mirrors Large Card structure and surface treatment.
 * Only the overall size and internal spacing are reduced.
 * Standard CSS owns all visual surface properties.
 */
class SmallCard extends HTMLElement {
  connectedCallback() {
    if (this.dataset.miniCardReady === "true") return;
    this.dataset.miniCardReady = "true";
  }
}

if (!customElements.get("small-card")) {
  customElements.define("small-card", MiniCard);
}
