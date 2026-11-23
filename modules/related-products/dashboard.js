(() => {
  "use strict";
  window.__3bModules = window.__3bModules || {};
  const module = window.__3bModules.relatedProducts = window.__3bModules.relatedProducts || {};
  module.mountDashboard = async root => {
    if (!root || root.dataset.relatedProductsMounted === "true") return;
    root.dataset.relatedProductsMounted = "true";
    const product = module.product;
    const panel = document.createElement("section");
    panel.className = "related-products-admin ui-card";
    panel.innerHTML = `
      <h2>Related Products</h2>
      <div id="related-products-list" class="related-products-admin-list ui-stack"></div>
      <h2 id="related-products-form-title">Add Product</h2>
      <form id="related-products-form" class="ui-form">
        <div class="related-products-field"><label class="ui-form-label" for="os-name">Name</label><input id="os-name" class="ui-form-control" type="text" maxlength="180" required></div>
        <div class="related-products-field"><label class="ui-form-label" for="os-slug">Slug</label><input id="os-slug" class="ui-form-control" type="text" maxlength="180" pattern="[a-z0-9]+(-[a-z0-9]+)*" required></div>
        <div class="related-products-field"><label class="ui-form-label" for="os-icon">Icon</label><input id="os-icon" class="ui-form-control" type="text" maxlength="80" placeholder="Emoji or icon text"></div>
        <div class="related-products-field"><label class="ui-form-label" for="os-image">Image</label><input id="os-image" class="ui-form-control" type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif"><img id="os-image-preview" class="related-products-preview" alt="Product image preview" hidden></div>
        <fieldset class="related-products-field"><legend>Visibility</legend><div id="os-roles" class="related-products-role-list"></div></fieldset>
        <div class="related-products-field"><label class="ui-form-label" for="os-status">Status</label><select id="os-status" class="ui-select"><option value="draft">Draft</option><option value="published">Published</option></select></div>
        <div class="related-products-form-actions"><button class="ui-button ui-button-primary primary" type="submit">Save Product</button><button id="os-cancel" class="ui-button" type="button">Cancel</button><button id="os-delete" class="ui-button danger" type="button" hidden>Delete</button></div>
      </form>
      <p id="os-status-message" class="related-products-status ui-status" role="status" aria-live="polite"></p>
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
      $("#related-products-form").reset();
      $("#os-image-preview").hidden = true;
      $("#related-products-form-title").textContent = "Add Product";
      $("#related-products-form").querySelector('[type="submit"]').textContent = "Save Product";
      $("#os-delete").hidden = true;
      $("#os-status").value = "draft";
      $("#os-roles").querySelectorAll("input").forEach(input => {
        input.checked = roles.some(role => role.slug === "visitor" && role.id === input.value);
      });
    };
    const renderList = () => {
      const list = $("#related-products-list");
      list.replaceChildren();
      if (!services.length) {
        list.textContent = "No related products have been created yet.";
        return;
      }
      services.forEach(item => {
        const card = document.createElement("button");
        card.type = "button";
        card.className = "related-products-admin-item";
        card.classList.toggle("is-selected", editingId === item.id);
        card.setAttribute("aria-pressed", String(editingId === item.id));
        const identity = document.createElement("span");
        identity.className = "related-products-admin-identity ui-stack";
        const name = document.createElement("strong");
        name.textContent = item.name;
        const slug = document.createElement("span");
        slug.className = "related-products-admin-slug";
        slug.textContent = item.slug;
        identity.append(name, slug);
        const details = document.createElement("span");
        details.className = "related-products-admin-meta";
        const visibleRoles = roles.filter(role => (item.visible_role_ids || []).includes(role.id)).map(role => role.name);
        const visibility = document.createElement("span");
        visibility.textContent = "Visibility: " + (visibleRoles.length ? visibleRoles.join(", ") : "None");
        const state = document.createElement("span");
        state.textContent = "Status: " + (item.status || "draft");
        details.append(visibility, state);
        if (item.icon) {
          const icon = document.createElement("span");
          icon.textContent = "Icon: " + item.icon;
          details.appendChild(icon);
        }
        card.append(identity, details);
        card.addEventListener("click", () => fillForm(item));
        list.appendChild(card);
      });
    };
    const fillForm = item => {
      editingId = item.id;
      imagePath = item.image_path || null;
      slugManuallyEdited = true;
      $("#related-products-form-title").textContent = "Edit Product";
      $("#related-products-form").querySelector('[type="submit"]').textContent = "Update Product";
      $("#os-delete").hidden = false;
      $("#os-name").value = item.name || "";
      $("#os-slug").value = item.slug || "";
      $("#os-icon").value = item.icon || "";
      $("#os-status").value = item.status || "draft";
      $("#os-roles").querySelectorAll("input").forEach(input => {
        input.checked = (item.visible_role_ids || []).includes(input.value);
      });
      if (imagePath) {
        $("#os-image-preview").src = product.publicImageUrl(imagePath);
        $("#os-image-preview").hidden = false;
      } else {
        $("#os-image-preview").hidden = true;
      }
      status("Editing " + item.name + ".");
      $("#related-products-form-title").scrollIntoView({ behavior: "smooth", block: "start" });
      renderList();
    };
    const refresh = async () => {
      services = await product.listManage();
      renderList();
    };
    try {
      roles = await product.getRoles();
      const roleList = $("#os-roles");
      roles.forEach(role => {
        const label = document.createElement("label");
        label.className = "related-products-role";
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
      status(error.message || "Unable to load Related Products.");
      return;
    }
    $("#os-name").addEventListener("input", () => {
      if (!slugManuallyEdited) $("#os-slug").value = product.toSlug($("#os-name").value);
    });
    $("#os-slug").addEventListener("input", () => { slugManuallyEdited = true; });
    $("#os-image").addEventListener("change", async event => {
      const file = event.target.files?.[0];
      if (!file) return;
      try {
        status("Uploading image…");
        imagePath = await product.uploadImage(file);
        $("#os-image-preview").src = product.publicImageUrl(imagePath);
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
      try { await product.remove(item.id); clearForm(); await refresh(); status("Product deleted."); }
      catch (error) { status(error.message || "Unable to delete product."); }
      finally { button.disabled = false; }
    });
    $("#related-products-form").addEventListener("submit", async event => {
      event.preventDefault();
      const button = $("#related-products-form").querySelector('[type="submit"]');
      button.disabled = true;
      status(editingId ? "Updating…" : "Saving…");
      try {
        const visibleRoleIds = [...$("#os-roles").querySelectorAll("input:checked")].map(input => input.value);
        await product.save({
          name: $("#os-name").value,
          slug: $("#os-slug").value,
          icon: $("#os-icon").value,
          image_path: imagePath,
          visible_role_ids: visibleRoleIds,
          status: $("#os-status").value
        }, editingId);
        clearForm();
        await refresh();
        status("Product saved successfully.");
      } catch (error) {
        status(error.message || "Unable to save product.");
      } finally {
        button.disabled = false;
      }
    });
  };
})();