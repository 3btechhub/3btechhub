import { CrudCore } from "./crud-core.js";
import { getCrudConfig } from "./crud-config.js";

class CrudInterface extends HTMLElement {
  connectedCallback() {
    if (this.dataset.initialized === "true") return;
    this.dataset.initialized = "true";

    this.config = this.config || getCrudConfig(this.dataset.config);
    if (!this.config) {
      this.showError("CRUD configuration was not found.");
      return;
    }

    this.client = this.client || window.supabaseClient;
    if (!this.client) {
      this.showError("A Supabase client must be assigned to the CRUD interface.");
      return;
    }

    this.core = new CrudCore(this.client, this.config);
    this.activeRecord = null;
    this.render();
    this.loadRecords();
  }

  setConfiguration(configuration, client) {
    this.config = configuration;
    if (client) this.client = client;
    this.dataset.initialized = "false";
  }

  showError(message) {
    this.replaceChildren();
    const error = document.createElement("p");
    error.className = "crud-interface__message crud-interface__message--error";
    error.textContent = message;
    this.append(error);
  }

  render() {
    this.classList.add("crud-interface");
    this.replaceChildren();

    const heading = document.createElement("h2");
    heading.className = "crud-interface__title";
    heading.textContent = this.config.title || "Records";
    this.append(heading);

    this.status = document.createElement("p");
    this.status.className = "crud-interface__message";
    this.status.setAttribute("role", "status");
    this.append(this.status);

    this.listRegion = document.createElement("section");
    this.listRegion.className = "crud-interface__list";
    this.append(this.listRegion);

    this.formRegion = document.createElement("section");
    this.formRegion.className = "crud-interface__form-region";
    this.formRegion.hidden = true;
    this.append(this.formRegion);
  }

  async loadRecords() {
    this.setStatus("Loading...");
    try {
      const records = await this.core.read(this.config.filters || {});
      this.renderList(records);
      this.setStatus("");
    } catch (error) {
      this.setStatus(error.message || "Could not load records.", true);
    }
  }

  renderList(records) {
    this.listRegion.replaceChildren();

    const actions = this.config.actions || ["create", "read", "update", "delete"];
    if (actions.includes("create")) {
      const addButton = this.makeButton("Add New", "crud-interface__button", () => {
        this.openForm(null);
      });
      this.listRegion.append(addButton);
    }

    if (!records.length) {
      const empty = document.createElement("p");
      empty.className = "crud-interface__empty";
      empty.textContent = this.config.emptyMessage || "No records found.";
      this.listRegion.append(empty);
      return;
    }

    const table = document.createElement("table");
    table.className = "crud-interface__table";
    const head = document.createElement("thead");
    const headRow = document.createElement("tr");

    for (const field of this.config.fields) {
      const cell = document.createElement("th");
      cell.scope = "col";
      cell.textContent = field.label || field.name;
      headRow.append(cell);
    }

    if (actions.includes("update")) {
      const cell = document.createElement("th");
      cell.scope = "col";
      cell.textContent = "Action";
      headRow.append(cell);
    }

    head.append(headRow);
    table.append(head);

    const body = document.createElement("tbody");
    for (const record of records) {
      const row = document.createElement("tr");
      for (const field of this.config.fields) {
        const cell = document.createElement("td");
        const value = record[field.name];
        cell.textContent = value === null || value === undefined ? "" : String(value);
        row.append(cell);
      }

      if (actions.includes("update")) {
        const cell = document.createElement("td");
        cell.append(this.makeButton("Edit", "crud-interface__button", () => {
          this.openForm(record);
        }));
        row.append(cell);
      }

      body.append(row);
    }

    table.append(body);
    this.listRegion.append(table);
  }

  openForm(record = null) {
    this.activeRecord = record;
    const mode = this.core.getMode(record);
    const actions = this.config.actions || ["create", "read", "update", "delete"];
    const form = document.createElement("form");
    form.className = "crud-interface__form";

    const formTitle = document.createElement("h3");
    formTitle.textContent = mode === "create" ? "Create New" : "Update Record";
    form.append(formTitle);

    for (const field of this.config.fields) {
      const wrapper = document.createElement("label");
      wrapper.className = "crud-interface__field";
      const label = document.createElement("span");
      label.textContent = field.label || field.name;
      wrapper.append(label);

      let input;
      if (field.type === "textarea") {
        input = document.createElement("textarea");
      } else if (field.type === "select") {
        input = document.createElement("select");
        for (const option of field.options || []) {
          const optionElement = document.createElement("option");
          optionElement.value = option.value;
          optionElement.textContent = option.label ?? option.value;
          input.append(optionElement);
        }
      } else {
        input = document.createElement("input");
        input.type = field.type || "text";
      }

      input.name = field.name;
      input.required = field.required === true;
      if (field.placeholder) input.placeholder = field.placeholder;

      const currentValue = record?.[field.name];
      if (field.type === "checkbox") {
        input.checked = currentValue === true;
      } else if (currentValue !== null && currentValue !== undefined) {
        input.value = String(currentValue);
      }
      if (field.disabled === true) input.disabled = true;

      wrapper.append(input);
      form.append(wrapper);
    }

    const buttonRow = document.createElement("div");
    buttonRow.className = "crud-interface__actions";

    if (mode === "create") {
      if (actions.includes("create")) {
        buttonRow.append(this.makeButton("Save", "crud-interface__button crud-interface__button--primary", () => {
          this.submitForm(form, "create");
        }, "submit"));
      }
      buttonRow.append(this.makeButton("Cancel", "crud-interface__button", () => {
        this.closeForm();
      }));
    } else {
      if (actions.includes("update")) {
        buttonRow.append(this.makeButton("Update", "crud-interface__button crud-interface__button--primary", () => {
          this.submitForm(form, "update");
        }, "submit"));
      }
      buttonRow.append(this.makeButton("Cancel", "crud-interface__button", () => {
        this.closeForm();
      }));
      if (actions.includes("delete")) {
        buttonRow.append(this.makeButton("Delete", "crud-interface__button crud-interface__button--danger", () => {
          this.deleteRecord();
        }));
      }
    }

    form.append(buttonRow);
    form.addEventListener("submit", event => event.preventDefault());
    this.formRegion.replaceChildren(form);
    this.formRegion.hidden = false;
    this.listRegion.hidden = true;
    this.setStatus("");
  }

  makeButton(label, className, onClick, type = "button") {
    const button = document.createElement("button");
    button.type = type;
    button.className = className;
    button.textContent = label;
    button.addEventListener("click", event => {
      if (type === "submit") event.preventDefault();
      onClick();
    });
    return button;
  }

  getFormValues(form) {
    const values = {};
    for (const field of this.config.fields) {
      const input = form.elements.namedItem(field.name);
      if (!input || input.disabled) continue;
      values[field.name] = field.type === "checkbox"
        ? input.checked
        : input.value;
    }
    return values;
  }

  async submitForm(form, mode) {
    if (!form.reportValidity()) return;
    const values = this.getFormValues(form);

    this.setStatus(mode === "create" ? "Saving..." : "Updating...");
    try {
      if (mode === "create") {
        await this.core.create(values);
      } else {
        await this.core.update(this.activeRecord, values);
      }
      this.closeForm();
      await this.loadRecords();
    } catch (error) {
      this.setStatus(error.message || "The record could not be saved.", true);
    }
  }

  async deleteRecord() {
    if (!this.activeRecord) return;
    const confirmed = window.confirm("Delete this record? This action cannot be undone.");
    if (!confirmed) return;

    this.setStatus("Deleting...");
    try {
      await this.core.delete(this.activeRecord);
      this.closeForm();
      await this.loadRecords();
    } catch (error) {
      this.setStatus(error.message || "The record could not be deleted.", true);
    }
  }

  closeForm() {
    this.activeRecord = null;
    this.formRegion.replaceChildren();
    this.formRegion.hidden = true;
    this.listRegion.hidden = false;
    this.setStatus("");
  }

  setStatus(message, isError = false) {
    if (!this.status) return;
    this.status.textContent = message;
    this.status.classList.toggle("crud-interface__message--error", isError);
  }
}

if (!customElements.get("crud-interface")) {
  customElements.define("crud-interface", CrudInterface);
}

export { CrudInterface };
