import { supabase } from "./supabase-client.js";
import { getActiveRoles, withRequiredOwner } from "./rbv.js";
import "./large-card.js";

class ServiceCategoryEditorCard extends HTMLElement {
  connectedCallback() {
    if (this.dataset.initialized === "true") return;
    this.dataset.initialized = "true";
    this.render();
    this.form = this.querySelector("form");
    this.message = this.querySelector(".service-category-editor-card__message");
    this.button = this.querySelector('button[type="submit"]');
    this.form.addEventListener("submit", event => this.save(event));
    this.loadRoles();
  }

  render() {
    this.innerHTML = `
      <large-card class="service-category-editor-card">
        <h2 class="heading">Add Service Category</h2>
        <form class="service-category-editor-card__form">
          <input class="medium-input" type="text" name="name" placeholder="Name" maxlength="180" required>
          <input class="medium-input" type="text" name="slug" placeholder="Slug" maxlength="180" pattern="[a-z0-9]+(-[a-z0-9]+)*" required>
          <input class="medium-input" type="text" name="description" placeholder="Description" maxlength="1000">
          <input class="medium-input" type="text" name="icon" placeholder="Icon" maxlength="80">
          <input class="medium-input" type="text" name="image" placeholder="Image URL or storage path" maxlength="2048">
          <fieldset class="service-category-editor-card__visibility">
            <legend>Visibility</legend>
            <div class="service-category-editor-card__roles">
              <p>Loading roles…</p>
            </div>
          </fieldset>
          <button class="medium-button" type="submit" disabled>Save</button>
          <p class="service-category-editor-card__message" role="status" aria-live="polite"></p>
        </form>
      </large-card>
    `;
  }

  async loadRoles() {
    try {
      this.roles = await getActiveRoles();
      this.selectedRoleIds = new Set(withRequiredOwner([], this.roles));
      const owner = this.roles.find(role => role.slug === "owner");
      const roleMarkup = this.roles.map(role => {
        const isOwner = role.slug === "owner";
        const checked = this.selectedRoleIds.has(role.id);
        return `
          <label class="service-category-editor-card__role">
            <input type="checkbox" value="${this.escape(role.id)}" ${checked ? "checked" : ""} ${isOwner ? "disabled" : ""}>
            <span>${this.escape(role.name)}${isOwner ? " (Always selected)" : ""}</span>
          </label>
        `;
      }).join("");
      const list = this.querySelector(".service-category-editor-card__roles");
      list.innerHTML = roleMarkup || "<p>No active roles found.</p>";
      list.querySelectorAll('input[type="checkbox"]:not(:disabled)').forEach(input => {
        input.addEventListener("change", () => {
          if (input.checked) this.selectedRoleIds.add(input.value);
          else this.selectedRoleIds.delete(input.value);
        });
      });
      this.button.disabled = false;
    } catch (error) {
      this.setMessage(error?.message || "Roles could not be loaded.", true);
    }
  }

  async save(event) {
    event.preventDefault();
    this.setMessage("");
    if (!this.roles) {
      this.setMessage("Visibility roles are not ready.", true);
      return;
    }

    const values = new FormData(this.form);
    const name = String(values.get("name") || "").trim();
    const slug = String(values.get("slug") || "").trim();
    const description = String(values.get("description") || "").trim();
    const icon = String(values.get("icon") || "").trim();
    const imageValue = String(values.get("image") || "").trim();

    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) {
      this.setMessage("Slug must use lowercase letters, numbers, and single hyphens.", true);
      return;
    }

    this.setBusy(true);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error("Please sign in again.");

      const visibleRoleIds = withRequiredOwner([...this.selectedRoleIds], this.roles);
      const { error } = await supabase.from("our_services").insert({
        name,
        slug,
        description,
        icon,
        image_path: imageValue || null,
        visible_role_ids: visibleRoleIds,
        created_by: user.id,
        updated_by: user.id
      });
      if (error) throw error;

      this.form.reset();
      this.selectedRoleIds = new Set(withRequiredOwner([], this.roles));
      this.querySelectorAll('.service-category-editor-card__roles input[type="checkbox"]').forEach(input => {
        input.checked = this.selectedRoleIds.has(input.value);
      });
      this.setMessage("Service category saved successfully.");
    } catch (error) {
      const duplicate = error?.code === "23505";
      this.setMessage(
        duplicate ? "This slug is already in use." : (error?.message || "Service category could not be saved."),
        true
      );
    } finally {
      this.setBusy(false);
    }
  }

  setBusy(busy) {
    this.form.querySelectorAll("input, button").forEach(control => {
      if (control.type !== "checkbox" || !control.disabled) control.disabled = busy;
    });
    if (!busy && this.roles) this.button.disabled = false;
  }

  setMessage(message, isError = false) {
    this.message.textContent = message;
    this.message.dataset.state = isError ? "error" : "success";
  }

  escape(value) {
    return String(value).replace(/[&<>"']/g, char => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[char]);
  }
}

if (!customElements.get("service-category-editor-card")) {
  customElements.define("service-category-editor-card", ServiceCategoryEditorCard);
}
