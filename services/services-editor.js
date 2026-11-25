import { supabase } from "../supabase-client.js";
import { getActiveRoles, withRequiredOwner } from "../visibility/rbv.js";
import "../cards/large-card.js";
import "../media/media-uploader.js";

class ServiceCategoryEditorCard extends HTMLElement {
  connectedCallback() {
    if (this.dataset.initialized === "true") return;
    this.dataset.initialized = "true";
    this.render();
    this.form = this.querySelector("form");
    this.message = this.querySelector(".service-category-editor-card__message");
    this.button = this.querySelector('[data-action="save"]');
    this.imageUploader = this.querySelector('media-upload[asset-kind="service-image"]');
    this.iconUploader = this.querySelector('media-upload[asset-kind="service-icon"]');
    this.form.addEventListener("submit", event => this.save(event));
    this.querySelector('[data-action="cancel"]').addEventListener("click", () => this.resetForm());
    this.querySelector('[data-action="delete"]').addEventListener("click", () => this.deleteCurrent());
    this.loadRoles();
    window.addEventListener("service-category-edit", event => this.loadCategory(event.detail?.category));
  }

  render() {
    this.innerHTML = `
      <large-card class="service-category-editor-card">
        <h2 class="heading">Service Category Editor</h2>
        <form class="service-category-editor-card__form">
          <input class="medium-input" type="text" name="name" placeholder="Category Name" maxlength="180" required>
          <input class="medium-input" type="text" name="slug" placeholder="Category Slug" maxlength="180" pattern="[a-z0-9]+(-[a-z0-9]+)*" required>
          <textarea class="medium-input" name="description" placeholder="Category Description" maxlength="1000" rows="3"></textarea>
          <media-upload embedded asset-kind="service-image" accept="image/*" placeholder="Image URL or external URL"></media-upload>
          <media-upload embedded asset-kind="service-icon" accept=".svg,.ico,.png,.webp,image/svg+xml,image/x-icon,image/png,image/webp" placeholder="Icon URL or external URL"></media-upload>
          <fieldset class="rbv-editor__visibility">
            <legend>Visibility</legend>
            <div class="rbv-editor__roles"><p>Loading roles…</p></div>
          </fieldset>
          <div class="service-category-editor-card__actions">
            <button class="medium-button" data-action="save" type="submit" disabled>Save</button>
            <button class="medium-button" data-action="cancel" type="button">Cancel</button>
            <button class="medium-button service-category-editor-card__delete" data-action="delete" type="button" disabled>Delete</button>
          </div>
          <p class="service-category-editor-card__message" role="status" aria-live="polite"></p>
        </form>
      </large-card>`;
  }

  async loadRoles() {
    try {
      this.roles = await getActiveRoles();
      this.selectedRoleIds = new Set(withRequiredOwner([], this.roles));
      this.renderRoles();
      this.button.disabled = false;
    } catch (error) { this.setMessage(error?.message || "Roles could not be loaded.", true); }
  }

  renderRoles() {
    const list = this.querySelector(".rbv-editor__roles");
    list.innerHTML = this.roles.map(role => {
      const owner = role.slug === "owner";
      return `<label class="rbv-editor__role"><input type="checkbox" value="${this.escape(role.id)}" ${this.selectedRoleIds.has(role.id) ? "checked" : ""} ${owner ? "disabled" : ""}><span>${this.escape(role.name)}${owner ? " (Always selected)" : ""}</span></label>`;
    }).join("");
    list.querySelectorAll('input[type="checkbox"]:not(:disabled)').forEach(input => input.addEventListener("change", () => {
      if (input.checked) this.selectedRoleIds.add(input.value);
      else this.selectedRoleIds.delete(input.value);
    }));
  }

  async loadCategory(category) {
    if (!category?.id) return;
    this.currentId = category.id;
    this.form.elements.name.value = category.name || "";
    this.form.elements.slug.value = category.slug || "";
    this.form.elements.description.value = category.description || "";
    this.imageUploader.urlInput.value = category.image_path || "";
    this.iconUploader.urlInput.value = category.icon || "";
    this.imageUploader.syncState(); this.iconUploader.syncState();
    this.selectedRoleIds = new Set(withRequiredOwner(category.visible_role_ids || [], this.roles || []));
    if (this.roles) this.renderRoles();
    this.querySelector('[data-action="delete"]').disabled = false;
    this.querySelector('[data-action="save"]').textContent = "Save";
    this.setMessage("Editing selected category.");
    this.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async save(event) {
    event.preventDefault();
    if (!this.roles) return this.setMessage("Visibility roles are not ready.", true);
    const values = new FormData(this.form);
    const payload = {
      name: String(values.get("name") || "").trim(),
      slug: String(values.get("slug") || "").trim(),
      description: String(values.get("description") || "").trim(),
      icon: this.iconUploader.urlInput.value.trim(),
      image_path: this.imageUploader.urlInput.value.trim() || null,
      visible_role_ids: withRequiredOwner([...this.selectedRoleIds], this.roles)
    };
    if (!payload.name || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(payload.slug)) {
      return this.setMessage("Enter a category name and a valid lowercase slug.", true);
    }
    this.setBusy(true); this.setMessage("");
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!user) throw new Error("Please sign in again.");
      payload.updated_by = user.id;
      let query = supabase.from("services");
      if (this.currentId) query = query.update(payload).eq("id", this.currentId);
      else query = query.insert({ ...payload, created_by: user.id });
      const { error } = await query;
      if (error) throw error;
      this.setMessage("Service category saved successfully.");
      this.resetForm(false);
      window.dispatchEvent(new CustomEvent("service-categories-updated"));
    } catch (error) {
      this.setMessage(error?.code === "23505" ? "This slug is already in use." : (error?.message || "Category could not be saved."), true);
    } finally { this.setBusy(false); }
  }

  async deleteCurrent() {
    if (!this.currentId || !window.confirm("Delete this service category?")) return;
    this.setBusy(true);
    try {
      const { error } = await supabase.from("services").delete().eq("id", this.currentId);
      if (error) throw error;
      this.resetForm(false);
      this.setMessage("Service category deleted.");
      window.dispatchEvent(new CustomEvent("service-categories-updated"));
    } catch (error) { this.setMessage(error?.message || "Category could not be deleted.", true); }
    finally { this.setBusy(false); }
  }

  resetForm(clearMessage = true) {
    this.currentId = null;
    this.form.reset();
    [this.imageUploader, this.iconUploader].forEach(u => { u.urlInput.value = ""; u.fileInput.value = ""; u.syncState(); u.clearStatus(); });
    if (this.roles) { this.selectedRoleIds = new Set(withRequiredOwner([], this.roles)); this.renderRoles(); }
    this.querySelector('[data-action="delete"]').disabled = true;
    if (clearMessage) this.setMessage("");
  }

  setBusy(busy) {
    this.form.querySelectorAll("input, textarea, button").forEach(control => control.disabled = busy);
    if (!busy) this.querySelector('[data-action="delete"]').disabled = !this.currentId;
  }
  setMessage(message, error = false) { this.message.textContent = message; this.message.dataset.state = error ? "error" : "success"; }
  escape(value) { return String(value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
}
if (!customElements.get("service-category-editor-card")) customElements.define("service-category-editor-card", ServiceCategoryEditorCard);
