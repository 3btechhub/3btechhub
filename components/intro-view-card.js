import { getIntroContent } from "../modules/intro/intro-data.js";

/*
 * INTRO VIEW CARD
 * Used on Home. Displays the saved Intro content.
 * Heading style: heading.css (.heading).
 * Surface and spacing: intro-view-card.css + Standard CSS variables.
 * Theme colors and surfaces: supplied by the active Theme.
 * Content: public.intro_content through the shared Intro data layer.
 */

class IntroViewCard extends HTMLElement {
  connectedCallback() {
    if (this.dataset.initialized === "true") return;
    this.dataset.initialized = "true";

    this.innerHTML = `
      <section class="intro-view-card" aria-label="Introduction" hidden>
        <h1 class="heading intro-view-card__heading"></h1>
        <p class="intro-view-card__description"></p>
      </section>
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

if (!customElements.get("intro-view-card")) {
  customElements.define("intro-view-card", IntroViewCard);
}
