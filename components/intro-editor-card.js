import { getIntroContent, updateIntroContent } from "../modules/intro/intro-data.js";
import "./large-card.js";
import "./rbv-editor.js";

/* Intro editor: content and behavior are local; surface is Large Card + Standard CSS. */
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
          <button class="medium-button" type="submit">Save</button>
          <p class="intro-editor-card__message" role="status" aria-live="polite"></p>
        </form>
        <rbv-editor data-target-type="content" data-target-key="intro" data-table="intro_content" data-row-id="1"></rbv-editor>
      </large-card>
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
      this.querySelector("[name=\"heading\"]").value = content.heading || "";
      this.querySelector("[name=\"description\"]").value = content.sub_heading || "";
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
        heading: this.querySelector("[name=\"heading\"]").value,
        description: this.querySelector("[name=\"description\"]").value
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
    this.querySelector("[name=\"heading\"]").disabled = busy;
    this.querySelector("[name=\"description\"]").disabled = busy;
  }
  setMessage(message, isError = false) {
    this.message.textContent = message;
    this.message.dataset.state = isError ? "error" : "success";
  }
}
if (!customElements.get("intro-editor-card")) customElements.define("intro-editor-card", IntroEditorCard);
