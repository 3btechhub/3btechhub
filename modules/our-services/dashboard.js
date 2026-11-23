(() => {
  "use strict";
  window.__3bModules = window.__3bModules || {};
  const module = window.__3bModules.ourServices = window.__3bModules.ourServices || {};
  module.mountDashboard = async root => {
    if (!root || root.dataset.ourServicesMounted === "true") return;
    root.dataset.ourServicesMounted = "true";
    const service = module.service;
    const panel = document.createElement("section");
    panel.className = "our-services-admin";
    panel.innerHTML = `
      <h2>Our Services</h2>
      <div id="our-services-list" class="our-services-admin-list"></div>
      <h2 id="our-services-form-title">Add Service</h2>
      <form id="our-services-form">
        <div class="our-services-field"><label for="os-name">Name</label><input id="os-name" type="text" maxlength="180" required></div>
        <div class="our-services-field"><label for="os-slug">Slug</label><input id="os-slug" type="text" maxlength="180" pattern="[a-z0-9]+(-[a-z0-9]+)*" required></div>
        <div class="our-services-field"><label for="os-icon">Icon</label><input id="os-icon" type="text" maxlength="80" placeholder="Emoji or icon text"></div>
        <div class="our-services-field"><label for="os-image">Image</label><input id="os-image" type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif"><img id="os-image-preview" class="our-services-preview" alt="Service image preview" hidden></div>
        <div class="our-services-field"><label for="os-description">Description</label><textarea id="os-description" maxlength="1200"></textarea></div>
        <div class="our-services-field"><label for="os-details">Details</label><textarea id="os-details" rows="8"></textarea></div>
        <fieldset class="our-services-field"><legend>Visibility</legend><div id="os-roles" class="our-services-role-list"></div></fieldset>
        <div class="our-services-field"><label for="os-status">Status</label><select id="os-status"><option value="draft">Draft</option><option value="published">Published</option></select></div>
        <div class="our-services-form-actions"><button class="primary" type="submit">Save Service</button><button id="os-cancel" type="button">Clear Form</button></div>
      </form>
      <p id="os-status-message" class="our-services-status" role="status" aria-live="polite"></p>
    `;
    root.appendChild(panel);
    const $ = selector => panel.querySelector(selector);
    let roles = [];
    let services = [];
    let editingId = null;
    let imagePath = null;
    let slugManuallyEdited = false;
    const status = value => { $("#os-status-message").textContent = value; };
    const clearForm = () => {
      editingId = null;
      imagePath = null;
      slugManuallyEdited = false;
      $("#our-services-form").reset();
      $("#os-image-preview").hidden = true;
      $("#our-services-form-title").textContent = "Add Service";
      $("#os-status").value = "draft";
      $("#os-roles").querySelectorAll("input").forEach(input => { input.checked = false; });
    };
    const renderList = () => {
      const list = $("#our-services-list");
      list.replaceChildren();
      if (!services.length) {
        list.textContent = "No services have been created yet.";
        return;
      }
      services.forEach(item => {
        const row = document.createElement("div");
        row.className = "our-services-admin-item";
        const label = document.createElement("div");
        const name = document.createElement("strong");
        name.textContent = item.name;
        const meta = document.createElement("div");
        meta.textContent = item.slug + " · " + item.status;
        label.append(name, meta);
        const actions = document.createElement("div");
        actions.className = "our-services-admin-actions";
        const edit = document.createElement("button");
        edit.type = "button";
        edit.textContent = "Edit";
        edit.addEventListener("click", () => fillForm(item));
        const remove = document.createElement("button");
        remove.type = "button";
        remove.className = "danger";
        remove.textContent = "Delete";
        remove.addEventListener("click", async () => {
          if (!window.confirm("Delete “" + item.name + "”?")) return;
          remove.disabled = true;
          try {
            await service.remove(item.id);
            if (editingId === item.id) clearForm();
            await refresh();
            status("Service deleted.");
          } catch (error) {
            status(error.message || "Unable to delete service.");
            remove.disabled = false;
          }
        });
        actions.append(edit, remove);
        row.append(label, actions);
        list.appendChild(row);
      });
    };
    const fillForm = item => {
      editingId = item.id;
      imagePath = item.image_path || null;
      slugManuallyEdited = true;
      $("#our-services-form-title").textContent = "Edit Service";
      $("#os-name").value = item.name || "";
      $("#os-slug").value = item.slug || "";
      $("#os-icon").value = item.icon || "";
      $("#os-description").value = item.description || "";
      $("#os-details").value = item.details || "";
      $("#os-status").value = item.status || "draft";
      $("#os-roles").querySelectorAll("input").forEach(input => {
        input.checked = (item.visible_role_ids || []).includes(input.value);
      });
      if (imagePath) {
        $("#os-image-preview").src = service.publicImageUrl(imagePath);
        $("#os-image-preview").hidden = false;
      } else {
        $("#os-image-preview").hidden = true;
      }
      status("Editing " + item.name + ".");
      $("#our-services-form-title").scrollIntoView({ behavior: "smooth", block: "start" });
    };
    const refresh = async () => {
      services = await service.listManage();
      renderList();
    };
    try {
      roles = await service.getRoles();
      const roleList = $("#os-roles");
      roles.forEach(role => {
        const label = document.createElement("label");
        label.className = "our-services-role";
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.value = role.id;
        const text = document.createElement("span");
        text.textContent = role.name;
        label.append(checkbox, text);
        roleList.appendChild(label);
      });
      await refresh();
    } catch (error) {
      status(error.message || "Unable to load Our Services.");
      return;
    }
    $("#os-name").addEventListener("input", () => {
      if (!slugManuallyEdited) $("#os-slug").value = service.toSlug($("#os-name").value);
    });
    $("#os-slug").addEventListener("input", () => { slugManuallyEdited = true; });
    $("#os-image").addEventListener("change", async event => {
      const file = event.target.files?.[0];
      if (!file) return;
      try {
        status("Uploading image…");
        imagePath = await service.uploadImage(file);
        $("#os-image-preview").src = service.publicImageUrl(imagePath);
        $("#os-image-preview").hidden = false;
        status("Image uploaded. Save to apply it.");
      } catch (error) {
        status(error.message || "Image upload failed.");
        event.target.value = "";
      }
    });
    $("#os-cancel").addEventListener("click", clearForm);
    $("#our-services-form").addEventListener("submit", async event => {
      event.preventDefault();
      const button = $("#our-services-form").querySelector('[type="submit"]');
      button.disabled = true;
      status("Saving…");
      try {
        const visibleRoleIds = [...$("#os-roles").querySelectorAll("input:checked")].map(input => input.value);
        await service.save({
          name: $("#os-name").value,
          slug: $("#os-slug").value,
          icon: $("#os-icon").value,
          image_path: imagePath,
          description: $("#os-description").value,
          details: $("#os-details").value,
          visible_role_ids: visibleRoleIds,
          status: $("#os-status").value
        }, editingId);
        clearForm();
        await refresh();
        status("Service saved successfully.");
      } catch (error) {
        status(error.message || "Unable to save service.");
      } finally {
        button.disabled = false;
      }
    });
  };
})();