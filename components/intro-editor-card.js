import { getIntroContent, updateIntroContent } from "../modules/intro/intro-data.js";

/*
 * INTRO EDITOR CARD
 * Used on Dashboard. Owns the Intro editing interface and Save action.
 * Heading: heading.css (.heading).
 * Fields: medium-input.css (.medium-input).
 * Save action: medium-button.css (.medium-button).
 * Surface and spacing: intro-editor-card.css + Standard CSS variables.
 * Theme values: supplied by the active Theme.
 * Authorization: enforced by the existing intro_content RLS policies
 * using the module.intro.manage permission.
 */

class IntroEditorCard extends HTMLElement {
  connectedCallback() {
    if (this.dataset.initialized === "true") return;
    this.dataset.initialized = "true";

    this.innerHTML = `
      <section class="intro-editor-card">
        <h1 class="heading">Intro</h1>
        <form class="intro-editor-card__form">
          <input class="medium-input" type="text" name="heading" placeholder="Heading" maxlength="180" required>
          <input class="medium-input" type="text" name="description" placeholder="Description" maxlength="500" required>
          <button class="medium-button" type="submit">Save</button>
          <p class="intro-editor-card__message" role="status" aria-live="polite"></p>
        </form>
      </section>
    `;

    this.form = this.querySelector("form");
    this.message = this.querySelector(".intro-editor-card__message");
    this.button = this.querySelector("button");
    this.form.addEventListener("submit", event => this.save(event));
    this.loadContent();
  }

  async loadContent() {
    this.setBusy(true);
    try {
      const content = await getIntroContent();
      if (!content) throw new Error("Intro content is not available.");

      this.form.elements.heading.value = content.heading || "";
      this.form.elements.description.value = content.sub_heading || "";
    } catch (error) {
      this.setMessage(error?.message || "Intro could not be loaded.", true);
    } finally {
      this.setBusy(false);
    }
  }

  async save(event) {
    event.preventDefault();
    this.setMessage("");
    this.setBusy(true);

    try {
      await updateIntroContent({
        heading: this.form.elements.heading.value,
        description: this.form.elements.description.value
      });
      this.setMessage("Intro saved successfully.");
    } catch (error) {
      this.setMessage(error?.message || "Intro could not be saved.", true);
    } finally {
      this.setBusy(false);
    }
  }

  setBusy(busy) {
    this.button.disabled = busy;
    this.form.elements.heading.disabled = busy;
    this.form.elements.description.disabled = busy;
  }

  setMessage(message, isError = false) {
    this.message.textContent = message;
    this.message.dataset.state = isError ? "error" : "success";
  }
}

if (!customElements.get("intro-editor-card")) {
  customElements.define("intro-editor-card", IntroEditorCard);
}
