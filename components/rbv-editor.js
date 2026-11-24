import { supabase } from "./supabase-client.js";
import { getActiveRoles, withRequiredOwner } from "./rbv.js";

class RbvEditor extends HTMLElement {
  connectedCallback() {
    if (this.dataset.initialized === "true") return;
    this.dataset.initialized = "true";
    this.renderLoading();
    this.load().catch(error => this.showError(error));
  }

  renderLoading() {
    this.innerHTML = '<fieldset class="rbv-editor"><legend>Visibility – Select Roles</legend><p>Loading roles…</p></fieldset>';
  }

  async load() {
    this.roles = await getActiveRoles();
    const targetType = this.dataset.targetType;
    const targetKey = this.dataset.targetKey;
    const table = this.dataset.table;
    const rowId = this.dataset.rowId;

    let selectedIds = [];
    if (table && rowId) {
      const { data, error } = await supabase
        .from(table)
        .select("visible_role_ids")
        .eq("id", rowId)
        .maybeSingle();
      if (error) throw error;
      selectedIds = data?.visible_role_ids || [];
    } else {
      const { data, error } = await supabase
        .from("rbv_visibility")
        .select("visible_role_ids")
        .eq("target_type", targetType)
        .eq("target_key", targetKey)
        .maybeSingle();
      if (error) throw error;
      selectedIds = data?.visible_role_ids || [];
    }

    this.selected = new Set(withRequiredOwner(selectedIds, this.roles));
    this.render();
  }

  render() {
    const options = this.roles.map(role => {
      const owner = role.slug === "owner";
      const checked = this.selected.has(role.id) || owner;
      return `
        <label class="rbv-editor__option">
          <input type="checkbox" value="${this.escape(role.id)}" ${checked ? "checked" : ""} ${owner ? "disabled" : ""}>
          <span>${this.escape(role.name)}${owner ? " (Default · Locked)" : ""}</span>
        </label>
      `;
    }).join("");

    this.innerHTML = `
      <fieldset class="rbv-editor">
        <legend>Visibility – Select Roles</legend>
        <div class="rbv-editor__roles">${options}</div>
        <button class="medium-button rbv-editor__save" type="button">Save Visibility</button>
        <p class="rbv-editor__message" role="status" aria-live="polite"></p>
      </fieldset>
    `;

    this.querySelectorAll('input[type="checkbox"]:not(:disabled)').forEach(input => {
      input.addEventListener("change", () => {
        if (input.checked) this.selected.add(input.value);
        else this.selected.delete(input.value);
      });
    });

    this.querySelector(".rbv-editor__save").addEventListener("click", () => {
      this.save().catch(error => this.showError(error));
    });
  }

  async save() {
    const button = this.querySelector(".rbv-editor__save");
    const message = this.querySelector(".rbv-editor__message");
    button.disabled = true;
    message.textContent = "";

    try {
      const roleIds = withRequiredOwner([...this.selected], this.roles);
      const table = this.dataset.table;
      const rowId = this.dataset.rowId;
      let result;

      if (table && rowId) {
        result = await supabase
          .from(table)
          .update({ visible_role_ids: roleIds })
          .eq("id", rowId);
      } else {
        result = await supabase
          .from("rbv_visibility")
          .upsert({
            target_type: this.dataset.targetType,
            target_key: this.dataset.targetKey,
            visible_role_ids: roleIds
          }, { onConflict: "target_type,target_key" });
      }

      if (result.error) throw result.error;
      this.selected = new Set(roleIds);
      message.textContent = "Visibility saved.";
    } finally {
      button.disabled = false;
    }
  }

  showError(error) {
    const message = this.querySelector(".rbv-editor__message") ||
      this.querySelector("p");
    if (message) message.textContent = error?.message || "RBV could not be loaded.";
    else this.innerHTML = '<fieldset class="rbv-editor"><legend>Visibility</legend><p role="alert"></p></fieldset>';
    const alert = this.querySelector('[role="alert"]');
    if (alert) alert.textContent = error?.message || "RBV could not be loaded.";
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
