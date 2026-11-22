import { supabase } from "./supabase-client.js";

const element = (tag, className, text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
};

class OurServices extends HTMLElement {
  async connectedCallback() {
    if (this.dataset.initialized === "true") return;
    this.dataset.initialized = "true";

    try {
      const { data, error } = await supabase
        .from("our_services")
        .select("id, title, description")
        .eq("is_visible", true)
        .order("sort_order", { ascending: true })
        .order("id", { ascending: true });

      if (error) throw error;
      if (!data?.length) {
        this.hidden = true;
        return;
      }

      const section = element("section", "our-services");
      const heading = element("h2", "our-services__heading", "Our Services");
      const grid = element("div", "our-services__grid");

      data.forEach(service => {
        const card = element("article", "our-services__card");
        card.append(
          element("h3", "our-services__title", service.title),
          element("p", "our-services__description", service.description)
        );
        grid.append(card);
      });

      section.append(heading, grid);
      this.replaceChildren(section);
      this.hidden = false;
    } catch (error) {
      this.hidden = true;
      console.error("Our Services could not be loaded:", error);
    }
  }
}

class OurServicesEditor extends HTMLElement {
  async connectedCallback() {
    if (this.dataset.initialized === "true") return;
    this.dataset.initialized = "true";

    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || userData.user?.app_metadata?.role !== "Owner") {
        this.hidden = true;
        return;
      }

      const section = element("section", "our-services-editor");
      const heading = element("h2", "our-services-editor__heading", "Our Services");
      const form = element("form", "our-services-editor__form");
      const titleLabel = element("label", "", "Service Title");
      const titleInput = element("input");
      titleInput.type = "text";
      titleInput.name = "title";
      titleInput.maxLength = 120;
      titleInput.required = true;
      titleInput.placeholder = "Enter service title";
      titleLabel.append(titleInput);

      const descriptionLabel = element("label", "", "Description");
      const descriptionInput = element("textarea");
      descriptionInput.name = "description";
      descriptionInput.rows = 3;
      descriptionInput.maxLength = 600;
      descriptionInput.placeholder = "Enter a short description (optional)";
      descriptionLabel.append(descriptionInput);

      const visibleLabel = element("label", "our-services-editor__visibility");
      const visibleInput = element("input");
      visibleInput.type = "checkbox";
      visibleInput.name = "is_visible";
      visibleInput.checked = true;
      visibleLabel.append(visibleInput, document.createTextNode(" Show on homepage"));

      const submit = element("button", "our-services-editor__submit", "Add Service");
      submit.type = "submit";
      const cancel = element("button", "our-services-editor__cancel", "Cancel");
      cancel.type = "button";
      cancel.hidden = true;
      const status = element("p", "our-services-editor__status");
      status.setAttribute("role", "status");
      status.setAttribute("aria-live", "polite");
      const list = element("div", "our-services-editor__list");

      form.append(titleLabel, descriptionLabel, visibleLabel, submit, cancel, status);
      section.append(heading, form, list);
      this.replaceChildren(section);
      this.hidden = false;

      let editingId = null;
      let busy = false;

      const resetForm = () => {
        editingId = null;
        form.reset();
        visibleInput.checked = true;
        submit.textContent = "Add Service";
        cancel.hidden = true;
      };

      const loadItems = async () => {
        const { data, error } = await supabase
          .from("our_services")
          .select("id, title, description, is_visible, sort_order")
          .order("sort_order", { ascending: true })
          .order("id", { ascending: true });
        if (error) throw error;

        list.replaceChildren();
        if (!data?.length) {
          list.append(element("p", "our-services-editor__empty", "No services added yet."));
          return;
        }

        data.forEach(service => {
          const item = element("article", "our-services-editor__item");
          const details = element("div", "our-services-editor__details");
          details.append(
            element("h3", "", service.title),
            element("p", "", service.description || "No description"),
            element("span", "our-services-editor__state", service.is_visible ? "Visible on homepage" : "Hidden from homepage")
          );
          const actions = element("div", "our-services-editor__actions");
          const edit = element("button", "", "Edit");
          edit.type = "button";
          edit.addEventListener("click", () => {
            editingId = service.id;
            titleInput.value = service.title;
            descriptionInput.value = service.description || "";
            visibleInput.checked = service.is_visible;
            submit.textContent = "Save Changes";
            cancel.hidden = false;
            titleInput.focus();
          });
          const remove = element("button", "our-services-editor__delete", "Delete");
          remove.type = "button";
          remove.addEventListener("click", async () => {
            if (busy || !window.confirm("Delete this service?")) return;
            busy = true;
            remove.disabled = true;
            status.textContent = "Deleting…";
            try {
              const { error: deleteError } = await supabase
                .from("our_services")
                .delete()
                .eq("id", service.id);
              if (deleteError) throw deleteError;
              if (editingId === service.id) resetForm();
              await loadItems();
              status.textContent = "Service deleted.";
            } catch (deleteError) {
              console.error("Service delete failed:", deleteError);
              status.textContent = "Unable to delete service. Please try again.";
              remove.disabled = false;
            } finally {
              busy = false;
            }
          });
          actions.append(edit, remove);
          item.append(details, actions);
          list.append(item);
        });
      };

      cancel.addEventListener("click", () => {
        resetForm();
        status.textContent = "";
      });

      form.addEventListener("submit", async event => {
        event.preventDefault();
        if (busy) return;
        busy = true;
        submit.disabled = true;
        status.textContent = "Saving…";

        const payload = {
          title: titleInput.value.trim(),
          description: descriptionInput.value.trim(),
          is_visible: visibleInput.checked,
          updated_at: new Date().toISOString()
        };

        try {
          const query = editingId
            ? supabase.from("our_services").update(payload).eq("id", editingId)
            : supabase.from("our_services").insert(payload);
          const { error } = await query;
          if (error) throw error;
          const wasEditing = editingId !== null;
          resetForm();
          await loadItems();
          status.textContent = wasEditing ? "Service updated." : "Service added.";
        } catch (saveError) {
          console.error("Service save failed:", saveError);
          status.textContent = "Unable to save service. Please try again.";
        } finally {
          busy = false;
          submit.disabled = false;
        }
      });

      await loadItems();
    } catch (error) {
      this.hidden = true;
      console.error("Our Services editor could not be loaded:", error);
    }
  }
}

if (!customElements.get("our-services")) {
  customElements.define("our-services", OurServices);
}
if (!customElements.get("our-services-editor")) {
  customElements.define("our-services-editor", OurServicesEditor);
}
