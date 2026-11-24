import { supabase } from "./supabase-client.js";
import { getActiveRoles, withRequiredOwner } from "./rbv.js";

class RbvEditor extends HTMLElement {
  connectedCallback() {
    if (this.dataset.initialized === "true") return;
    this.dataset.initialized = "true";
    this.renderLoading();
    this.ready = this.load();
    this.ready.catch(error => this.showError(error));
  }

  get managedSave() {
    return this.hasAttribute("data-managed-save");
  }

  renderLoading() {
    this.innerHTML = '<div class="rbv-editor"><p>Loading roles…</p></div>';
  }

  async load() {
    this.roles = await getActiveRoles();
    let selectedIds = [];
    const table = this.dataset.table;
    const rowId = this.dataset.rowId;

    if (table && rowId) {
      const { data, error } = await supabase.from(table)
        .select("visible_role_ids").eq("id", rowId).maybeSingle();
      if (error) throw error;
      selectedIds = data?.visible_role_ids || [];
    } else {
      const { data, error } = await supabase.from("rbv_visibility")
        .select("visible_role_ids")
        .eq("target_type", this.dataset.targetType)
        .eq("target_key", this.dataset.targetKey).maybeSingle();
      if (error) throw error;
      selectedIds = data?.visible_role_ids || [];
    }

    this.selected = new Set(withRequiredOwner(selectedIds, this.roles));
    this.render();
  }

  render() {
    const options = this.roles.map(role => {
      const isOwner = role.slug === "owner";
      const checked = this.selected.has(role.id);
      return `
        <label class="service-category-editor-card__role">
          <input type="checkbox" value="${this.escape(role.id)}" ${checked ? "checked" : ""} ${isOwner ? "disabled" : ""}>
          <span>${this.escape(role.name)}${isOwner ? " (Always selected)" : ""}</span>
        </label>
      `;
    }).join("");

    this.innerHTML = `
      <div class="rbv-editor">
        <fieldset class="service-category-editor-card__visibility">
          <legend>Visibility</legend>
          <div class="service-category-editor-card__roles">${options}</div>
        </fieldset>
        ${this.managedSave ? "" : '<button class="medium-button rbv-editor__save" type="button">Save Visibility</button>'}
        ${this.managedSave ? "" : '<p class="rbv-editor__message" role="status" aria-live="polite"></p>'}
      </div>
    `;

    this.querySelectorAll('input[type="checkbox"]:not(:disabled)').forEach(input => {
      input.addEventListener("change", () => {
        if (input.checked) this.selected.add(input.value);
        else this.selected.delete(input.value);
      });
    });

    const saveButton = this.querySelector(".rbv-editor__save");
    saveButton?.addEventListener("click", () => {
      this.save().catch(error => this.showError(error));
    });
  }

  getSelectedRoleIds() {
    if (!this.roles || !this.selected) throw new Error("Visibility roles are not ready.");
    return withRequiredOwner([...this.selected], this.roles);
  }

  setControlsDisabled(disabled) {
    this.querySelectorAll('input[type="checkbox"]:not(:disabled)').forEach(input => {
      input.disabled = disabled;
    });
    const saveButton = this.querySelector(".rbv-editor__save");
    if (saveButton) saveButton.disabled = disabled;
  }

  async save() {
    const button = this.querySelector(".rbv-editor__save");
    const message = this.querySelector(".rbv-editor__message");
    if (button) button.disabled = true;
    if (message) message.textContent = "";

    try {
      const roleIds = this.getSelectedRoleIds();
      const table = this.dataset.table;
      const rowId = this.dataset.rowId;
      const result = table && rowId
        ? await supabase.from(table).update({ visible_role_ids: roleIds }).eq("id", rowId)
        : await supabase.from("rbv_visibility").upsert({
            target_type: this.dataset.targetType,
            target_key: this.dataset.targetKey,
            visible_role_ids: roleIds
          }, { onConflict: "target_type,target_key" });

      if (result.error) throw result.error;
      this.selected = new Set(roleIds);
      if (message) message.textContent = "Visibility saved.";
    } finally {
      if (button) button.disabled = false;
    }
  }

  showError(error) {
    const message = this.querySelector(".rbv-editor__message") || this.querySelector("p");
    if (message) message.textContent = error?.message || "RBV could not be loaded.";
    else this.innerHTML = '<div class="rbv-editor"><p role="alert"></p></div>';
  }

  escape(value) {
    return String(value).replace(/[&<>"']/g, char => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[char]);
  }
}

if (!customElements.get("rbv-editor")) {
  customElements.define("rbv-editor", RbvEditor);
}
