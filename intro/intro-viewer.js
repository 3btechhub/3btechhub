import { getIntroContent } from "./intro.js";
import "../cards/large-card.js";

/* Intro viewer: content is local; shared surface is supplied by Large Card + Standard CSS. */
class IntroViewCard extends HTMLElement {
  connectedCallback() {
    if (this.dataset.initialized === "true") return;
    this.dataset.initialized = "true";
    this.innerHTML = `
      <large-card class="intro-view-card" aria-label="Introduction" hidden>
        <h1 class="heading intro-view-card__heading"></h1>
        <p class="intro-view-card__description"></p>
      </large-card>
    `;
    this.loadContent();
  }
  async loadContent() {
    const card = this.querySelector(".intro-view-card");
    try {
      const content = await getIntroContent();
      if (!content) return;
      const heading = String(content.heading || "").trim();
      const description = String(content.sub_heading || "").trim();
      this.querySelector(".intro-view-card__heading").textContent = heading;
      this.querySelector(".intro-view-card__description").textContent = description;
      card.hidden = !heading && !description;
    } catch (error) {
      console.error("Intro content could not be loaded.", error);
      card.hidden = true;
    }
  }
}
if (!customElements.get("intro-view-card")) customElements.define("intro-view-card", IntroViewCard);
