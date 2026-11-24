import { getIntroContent, updateIntroContent } from "../../modules/intro/intro-data.js";
import "./large-card.js";
import "./rbv-editor.js";

/* Intro content and RBV are saved together from one form action. */
class IntroEditorCard extends HTMLElement {
  connectedCallback() {
    if (this.dataset.initialized === "true") return;
    this.dataset.initialized = "true";
    this.innerHTML = `
      <large-card class="intro-editor-card">
        <h1 class="heading">Intro</h1>
        <form class="intro-editor-card__form">
          <input class="medium-input" type="text" name="heading" placeholder="Heading" maxlength="180" required>
          <input class="medium-input" type="text" name="description" placeholder="Description" maxlength="500" required>
          <rbv-editor data-managed-save data-target-type="content" data-target-key="intro" data-table="intro_content" data-row-id="1"></rbv-editor>
          <button class="medium-button" type="submit" disabled>Save</button>
          <p class="intro-editor-card__message" role="status" aria-live="polite"></p>
        </form>
      </large-card>
    `;
    this.form = this.querySelector("form");
    this.message = this.querySelector(".intro-editor-card__message");
    this.button = this.querySelector('button[type="submit"]');
    this.rbv = this.querySelector("rbv-editor");
    this.form.addEventListener("submit", event => this.save(event));
    this.setBusy(true);
    Promise.all([this.loadContent(), this.rbv.ready])
      .then(() => this.setBusy(false))
      .catch(error => {
        this.setMessage(error?.message || "Intro could not be loaded.", true);
        this.setBusy(true);
      });
  }

  async loadContent() {
    const content = await getIntroContent();
    if (!content) throw new Error("Intro content is not available.");
    this.querySelector('[name="heading"]').value = content.heading || "";
    this.querySelector('[name="description"]').value = content.sub_heading || "";
  }

  async save(event) {
    event.preventDefault();
    this.setMessage("");
    this.setBusy(true);
    try {
      await updateIntroContent({
        heading: this.querySelector('[name="heading"]').value,
        description: this.querySelector('[name="description"]').value,
        visibleRoleIds: this.rbv.getSelectedRoleIds()
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
    this.querySelector('[name="heading"]').disabled = busy;
    this.querySelector('[name="description"]').disabled = busy;
    this.rbv?.setControlsDisabled(busy);
  }

  setMessage(message, isError = false) {
    this.message.textContent = message;
    this.message.dataset.state = isError ? "error" : "success";
  }
}

if (!customElements.get("intro-editor-card")) {
  customElements.define("intro-editor-card", IntroEditorCard);
}
