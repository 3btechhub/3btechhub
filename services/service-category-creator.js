import { supabase } from "../supabase-client.js";
import { registerCrudConfig } from "../crud/crud-config.js";
import { CrudCore } from "../crud/crud-core.js";
import "../cards/large-card.js";
import "../visibility/rbv-editor.js";

const CRUD_CONFIG = registerCrudConfig({
  id: "service-category-creator",
  table: "service_categories",
  primaryKey: "id",
  select: "id, name, slug, description, icon, image_path, visible_role_ids, created_by, updated_by, created_at, updated_at",
  orderBy: { column: "name", ascending: true },
  actions: ["create", "read", "update", "delete"],
  fields: [
    { name: "name", label: "Name" },
    { name: "slug", label: "Slug" },
    { name: "description", label: "Description" },
    { name: "icon", label: "Icon" },
    { name: "image_path", label: "Image" },
    { name: "visible_role_ids", label: "RBV" },
    { name: "created_by", label: "Created by" },
    { name: "updated_by", label: "Updated by" }
  ]
});

class ServiceCategoryCreator extends HTMLElement {
  connectedCallback() {
    if (this.dataset.initialized === "true") return;
    this.dataset.initialized = "true";
    this.core = new CrudCore(supabase, CRUD_CONFIG);
    this.activeRecord = null;
    this.render();
    this.loadRecords();
  }

  render() {
    this.innerHTML = `
      <large-card class="service-category-creator">
        <h2 class="service-category-creator__title">Service Category</h2>
        <div class="service-category-creator__status" role="status" aria-live="polite"></div>
        <section class="service-category-creator__list"></section>
        <section class="service-category-creator__form-region" hidden></section>
      </large-card>
    `;
    this.status = this.querySelector(".service-category-creator__status");
    this.listRegion = this.querySelector(".service-category-creator__list");
    this.formRegion = this.querySelector(".service-category-creator__form-region");
  }

  async loadRecords() {
    this.setStatus("Loading...");
    try {
      const records = await this.core.read();
      this.renderList(records);
      this.setStatus("");
    } catch (error) {
      this.setStatus(error?.message || "Service categories could not be loaded.", true);
    }
  }

  renderList(records) {
    this.listRegion.replaceChildren();
    const addButton = this.makeButton("Add New", "service-category-creator__button service-category-creator__button--primary", () => this.openForm(null));
    this.listRegion.append(addButton);

    if (!records.length) {
      const empty = document.createElement("p");
      empty.className = "service-category-creator__empty";
      empty.textContent = "No service categories found.";
      this.listRegion.append(empty);
      return;
    }

    const list = document.createElement("div");
    list.className = "service-category-creator__records";
    for (const record of records) {
      const item = document.createElement("article");
      item.className = "service-category-creator__record";

      const details = document.createElement("div");
      details.className = "service-category-creator__record-details";
      const name = document.createElement("h3");
      name.textContent = record.name;
      const slug = document.createElement("p");
      slug.textContent = record.slug;
      details.append(name, slug);

      if (record.description) {
        const description = document.createElement("p");
        description.textContent = record.description;
        details.append(description);
      }
      if (record.icon) {
        const icon = document.createElement("p");
        icon.textContent = "Icon: " + record.icon;
        details.append(icon);
      }
      if (record.image_path) {
        const image = document.createElement("img");
        image.className = "service-category-creator__preview";
        image.src = record.image_path;
        image.alt = record.name;
        image.loading = "lazy";
        image.addEventListener("error", () => image.hidden = true, { once: true });
        details.append(image);
      }

      const edit = this.makeButton("Edit", "service-category-creator__button", () => this.openForm(record));
      item.append(details, edit);
      list.append(item);
    }
    this.listRegion.append(list);
  }

  async openForm(record = null) {
    this.activeRecord = record;
    const mode = this.core.getMode(record);
    this.listRegion.hidden = true;
    this.formRegion.hidden = false;
    this.formRegion.innerHTML = `
      <form class="service-category-creator__form">
        <input class="medium-input" name="name" type="text" maxlength="180" placeholder="Name" autocomplete="off" required>
        <input class="medium-input" name="slug" type="text" maxlength="180" placeholder="Slug (e.g. tv-repair)" pattern="[a-z0-9]+(-[a-z0-9]+)*" autocomplete="off" required>
        <textarea class="medium-input service-category-creator__textarea" name="description" placeholder="Description" rows="4"></textarea>
        <input class="medium-input" name="icon" type="text" maxlength="120" placeholder="Icon (icon name or class)">
        <input class="medium-input" name="image_path" type="url" placeholder="Image URL">
        <rbv-editor data-managed-save data-target-type="component" data-target-key="service-category-creator"></rbv-editor>
        <div class="service-category-creator__actions"></div>
      </form>
    `;

    const form = this.formRegion.querySelector("form");
    const rbv = form.querySelector("rbv-editor");
    if (record) {
      rbv.dataset.table = "service_categories";
      rbv.dataset.rowId = record.id;
    }

    form.elements.name.value = record?.name || "";
    form.elements.slug.value = record?.slug || "";
    form.elements.description.value = record?.description || "";
    form.elements.icon.value = record?.icon || "";
    form.elements.image_path.value = record?.image_path || "";

    const actions = form.querySelector(".service-category-creator__actions");
    if (mode === "create") {
      actions.append(
        this.makeButton("Save", "service-category-creator__button service-category-creator__button--primary", () => this.submitForm(form, rbv, "create")),
        this.makeButton("Cancel", "service-category-creator__button", () => this.closeForm())
      );
    } else {
      actions.append(
        this.makeButton("Update", "service-category-creator__button service-category-creator__button--primary", () => this.submitForm(form, rbv, "update")),
        this.makeButton("Cancel", "service-category-creator__button", () => this.closeForm()),
        this.makeButton("Delete", "service-category-creator__button service-category-creator__button--danger", () => this.deleteRecord())
      );
    }

    try {
      await rbv.ready;
    } catch (error) {
      this.setStatus(error?.message || "RBV could not be loaded.", true);
      actions.querySelectorAll("button").forEach(button => button.disabled = true);
    }
  }

  async submitForm(form, rbv, mode) {
    if (!form.reportValidity()) return;
    const buttons = form.querySelectorAll("button");
    buttons.forEach(button => button.disabled = true);
    this.setStatus(mode === "create" ? "Saving..." : "Updating...");

    try {
      await rbv.ready;
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!authData.user) throw new Error("Please sign in before managing service categories.");

      const values = {
        name: form.elements.name.value.trim(),
        slug: form.elements.slug.value.trim().toLowerCase(),
        description: form.elements.description.value.trim(),
        icon: form.elements.icon.value.trim(),
        image_path: form.elements.image_path.value.trim() || null,
        visible_role_ids: rbv.getSelectedRoleIds(),
        updated_by: authData.user.id
      };

      if (mode === "create") {
        values.created_by = authData.user.id;
        await this.core.create(values);
      } else {
        values.created_by = this.activeRecord.created_by;
        await this.core.update(this.activeRecord, values);
      }

      this.closeForm();
      await this.loadRecords();
    } catch (error) {
      this.setStatus(error?.message || "Service category could not be saved.", true);
      buttons.forEach(button => button.disabled = false);
    }
  }

  async deleteRecord() {
    if (!this.activeRecord) return;
    if (!window.confirm("Delete this service category? This action cannot be undone.")) return;
    this.setStatus("Deleting...");
    try {
      await this.core.delete(this.activeRecord);
      this.closeForm();
      await this.loadRecords();
    } catch (error) {
      this.setStatus(error?.message || "Service category could not be deleted.", true);
    }
  }

  closeForm() {
    this.activeRecord = null;
    this.formRegion.replaceChildren();
    this.formRegion.hidden = true;
    this.listRegion.hidden = false;
    this.setStatus("");
  }

  makeButton(label, className, onClick) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = className;
    button.textContent = label;
    button.addEventListener("click", onClick);
    return button;
  }

  setStatus(message, isError = false) {
    if (!this.status) return;
    this.status.textContent = message;
    this.status.dataset.state = isError ? "error" : "";
  }
}

if (!customElements.get("service-category-creator")) {
  customElements.define("service-category-creator", ServiceCategoryCreator);
}
