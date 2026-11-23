(() => {
  "use strict";
  window.__3bModules = window.__3bModules || {};
  const module = window.__3bModules.ourServices = window.__3bModules.ourServices || {};
  module.mountDashboard = async root => {
    if (!root || root.dataset.ourServicesMounted === "true") return;
    root.dataset.ourServicesMounted = "true";
    const service = module.service;
    const panel = document.createElement("section");
    panel.className = "our-services-admin ui-admin-panel ui-card";
    panel.innerHTML = `
      <h2>Our Services</h2>
      <div id="our-services-list" class="our-services-admin-list ui-stack"></div>
      <h2 id="our-services-form-title">Add Service</h2>
      <form id="our-services-form" class="ui-form">
        <div class="ui-form-field"><label class="ui-form-label" for="os-name">Name</label><input id="os-name" class="ui-input" type="text" maxlength="180" required></div>
        <div class="ui-form-field"><label class="ui-form-label" for="os-slug">Slug</label><input id="os-slug" class="ui-input" type="text" maxlength="180" pattern="[a-z0-9]+(-[a-z0-9]+)*" required></div>
        <div class="ui-form-field"><label class="ui-form-label" for="os-icon">Icon</label><input id="os-icon" class="ui-input" type="text" maxlength="80" placeholder="Emoji or icon text"></div>
        <div class="ui-form-field"><label class="ui-form-label" for="os-image">Image</label><input id="os-image" class="ui-input" type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif"><img id="os-image-preview" class="our-services-preview" alt="Service image preview" hidden></div>
        <div class="ui-form-field"><label class="ui-form-label">Visibility</label><div id="os-roles" class="ui-visibility-list"></div></div>
        <div class="our-services-form-actions ui-form-actions"><button class="ui-button ui-button-primary" type="submit">Save Service</button><button id="os-cancel" class="ui-button" type="button">Cancel</button><button id="os-delete" class="ui-button ui-button-danger" type="button" hidden>Delete</button></div>
      </form>
      <p id="os-status-message" class="our-services-status ui-status" role="status" aria-live="polite"></p>
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
      $("#our-services-form").querySelector('[type="submit"]').textContent = "Save Service";
      $("#os-delete").hidden = true;
      $("#os-roles").querySelectorAll("input").forEach(input => {
        input.checked = roles.some(role => role.slug === "visitor" && role.id === input.value);
      });
    };
    const renderList = () => {
      const list = $("#our-services-list");
      list.replaceChildren();
      if (!services.length) { list.textContent = "No items have been created yet."; return; }
      services.forEach(item => {
        const visibleRoles = roles.filter(role => (item.visible_role_ids || []).includes(role.id)).map(role => role.name);
        const tile = window.__3bComponents.itemCard.render({
          item, tag: "button",
          visibility: visibleRoles.length ? visibleRoles.join(", ") : "None",
          imageUrl: item.image_path ? service.publicImageUrl(item.image_path) : "",
          icon: item.icon || "",
          iconUrl: !item.image_path && !item.icon ? new URL("assets/icons/" + item.slug + ".svg", window.__3bBaseUrl || location.href).href : "",
          selected: editingId === item.id,
          onClick: () => fillForm(item)
        });
        list.appendChild(tile);
      });
    };
    const fillForm = item => {
      editingId = item.id;
      imagePath = item.image_path || null;
      slugManuallyEdited = true;
      $("#our-services-form-title").textContent = "Edit Service";
      $("#our-services-form").querySelector('[type="submit"]').textContent = "Update Service";
      $("#os-delete").hidden = false;
      $("#os-name").value = item.name || "";
      $("#os-slug").value = item.slug || "";
      $("#os-icon").value = item.icon || "";
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
      renderList();
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
        label.className = "ui-visibility-option";
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "ui-checkbox";
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
    $("#os-cancel").addEventListener("click", () => { clearForm(); renderList(); status("Editing cancelled."); });
    $("#os-delete").addEventListener("click", async () => {
      const item = services.find(entry => entry.id === editingId);
      if (!item || !window.confirm("Delete “" + item.name + "”?")) return;
      const button = $("#os-delete"); button.disabled = true;
      try { await service.remove(item.id); clearForm(); await refresh(); status("Service deleted."); }
      catch (error) { status(error.message || "Unable to delete service."); }
      finally { button.disabled = false; }
    });
    $("#our-services-form").addEventListener("submit", async event => {
      event.preventDefault();
      const button = $("#our-services-form").querySelector('[type="submit"]');
      button.disabled = true;
      status(editingId ? "Updating…" : "Saving…");
      try {
        const visibleRoleIds = [...$("#os-roles").querySelectorAll("input:checked")].map(input => input.value);
        await service.save({
          name: $("#os-name").value,
          slug: $("#os-slug").value,
          icon: $("#os-icon").value,
          image_path: imagePath,
          visible_role_ids: visibleRoleIds
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