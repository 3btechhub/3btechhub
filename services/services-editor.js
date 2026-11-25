import { supabase } from "../supabase-client.js";
import "../cards/large-card.js";
import "../visibility/rbv-editor.js";

const SERVICES_ROW_ID = 1;

class ServicesEditorCard extends HTMLElement {
  connectedCallback() {
    if (this.dataset.initialized === "true") return;
    this.dataset.initialized = "true";
    this.render();
    this.form = this.querySelector("form");
    this.headingInput = this.querySelector('[name="heading"]');
    this.button = this.querySelector('button[type="submit"]');
    this.message = this.querySelector(".services-editor-card__message");
    this.rbv = this.querySelector("rbv-editor");

    this.form.addEventListener("submit", event => this.save(event));
    this.setBusy(true);

    Promise.all([this.loadSettings(), this.rbv.ready])
      .then(() => this.setBusy(false))
      .catch(error => {
        this.setMessage(error?.message || "Services settings could not be loaded.", true);
        this.setBusy(true);
      });
  }

  render() {
    this.innerHTML = `
      <large-card class="services-editor-card">
        <h2 class="heading">Services</h2>
        <form class="services-editor-card__form">
          <input class="medium-input" type="text" name="heading" placeholder="Heading" maxlength="180" autocomplete="off" required>
          <rbv-editor data-managed-save data-target-type="module" data-target-key="services"></rbv-editor>
          <button class="medium-button" type="submit" disabled>Save</button>
          <p class="services-editor-card__message" role="status" aria-live="polite"></p>
        </form>
      </large-card>
    `;
  }

  async loadSettings() {
    const { data, error } = await supabase
      .from("services")
      .select("heading")
      .eq("id", SERVICES_ROW_ID)
      .single();

    if (error) throw error;
    this.headingInput.value = data?.heading || "";
  }

  async save(event) {
    event.preventDefault();
    this.setMessage("");
    this.setBusy(true);

    try {
      const heading = this.headingInput.value.trim();
      if (!heading) throw new Error("Enter a Services heading.");

      const visibleRoleIds = this.rbv.getSelectedRoleIds();
      const { error } = await supabase.rpc("save_services_settings", {
        p_heading: heading,
        p_visible_role_ids: visibleRoleIds
      });

      if (error) throw error;
      this.setMessage("Services settings saved successfully.");
    } catch (error) {
      this.setMessage(error?.message || "Services settings could not be saved.", true);
    } finally {
      this.setBusy(false);
    }
  }

  setBusy(busy) {
    if (this.button) this.button.disabled = busy;
    if (this.headingInput) this.headingInput.disabled = busy;
    this.rbv?.setControlsDisabled(busy);
  }

  setMessage(message, isError = false) {
    if (!this.message) return;
    this.message.textContent = message;
    this.message.dataset.state = isError ? "error" : (message ? "success" : "");
  }
}

if (!customElements.get("services-editor-card")) {
  customElements.define("services-editor-card", ServicesEditorCard);
}
