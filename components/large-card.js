/*
 * LARGE CARD — Shared card surface component
 *
 * All reusable Cards and Forms use this component as their outer surface.
 * Width, padding, spacing, border, radius, shadow and theme surface values
 * are owned by Standard CSS. Content layout and behavior remain local.
 */
class LargeCard extends HTMLElement {
  connectedCallback() {
    if (this.dataset.largeCardReady === "true") return;
    this.dataset.largeCardReady = "true";
  }
}

if (!customElements.get("large-card")) {
  customElements.define("large-card", LargeCard);
}
