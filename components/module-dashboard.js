(() => {
  "use strict";
  window.__3bComponents = window.__3bComponents || {};
  window.__3bComponents.moduleDashboard = {
    async mount(root, config) {
      if (!root || !config?.key || !config.api) return;
      const mountKey = config.key + "DashboardMounted";
      if (root.dataset[mountKey] === "true") return;
      root.dataset[mountKey] = "true";

      const { key, title, singular, plural, api } = config;
      const panel = document.createElement("section");
      panel.className = "ui-section-card ui-size-large ui-admin-panel";
      panel.innerHTML = `
        <h2>${title}</h2>
        <div data-role="list" class="ui-admin-list ui-stack"></div>
        <h2 data-role="form-title">Add ${singular}</h2>
        <form class="ui-form" data-role="form">
          <div class="ui-form-field"><label class="ui-form-label" for="${key}-name">Name</label><input id="${key}-name" data-field="name" class="ui-input" type="text" maxlength="180" required></div>
          <div class="ui-form-field"><label class="ui-form-label" for="${key}-slug">Slug</label><input id="${key}-slug" data-field="slug" class="ui-input" type="text" maxlength="180" pattern="[a-z0-9]+(-[a-z0-9]+)*" required></div>
          <div class="ui-form-field"><label class="ui-form-label" for="${key}-icon">Icon</label><input id="${key}-icon" data-field="icon" class="ui-input" type="text" maxlength="80" placeholder="Emoji or icon text"></div>
          <div class="ui-form-field"><label class="ui-form-label" for="${key}-image">Image</label><input id="${key}-image" data-field="image" class="ui-input" type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif"><img data-role="image-preview" class="ui-admin-image-preview" alt="${singular} image preview" hidden></div>
          <div class="ui-form-field"><label class="ui-form-label">Visibility</label><div data-role="visibility" class="ui-visibility-list"></div></div>
          <div class="ui-form-actions"><button class="ui-button ui-button-primary" type="submit">Save ${singular}</button><button data-action="cancel" class="ui-button" type="button">Cancel</button><button data-action="delete" class="ui-button ui-button-danger" type="button" hidden>Delete</button></div>
        </form>
        <p data-role="status" class="ui-status" role="status" aria-live="polite"></p>
      `;
      root.appendChild(panel);

      const $ = selector => panel.querySelector(selector);
      const field = name => panel.querySelector('[data-field="' + name + '"]');
      const visibility = window.__3bComponents.visibility;
      let roles = [];
      let items = [];
      let editingId = null;
      let imagePath = null;
      let slugManuallyEdited = false;
      const status = message => { $('[data-role="status"]').textContent = message; };

      const clearForm = () => {
        editingId = null;
        imagePath = null;
        slugManuallyEdited = false;
        $('[data-role="form"]').reset();
        $('[data-role="image-preview"]').hidden = true;
        $('[data-role="form-title"]').textContent = "Add " + singular;
        $('[type="submit"]').textContent = "Save " + singular;
        $('[data-action="delete"]').hidden = true;
        visibility.select($('[data-role="visibility"]'), visibility.visitorRoleIds(roles));
      };

      const renderList = () => {
        const list = $('[data-role="list"]');
        list.replaceChildren();
        if (!items.length) {
          list.textContent = "No items have been created yet.";
          return;
        }
        items.forEach(item => {
          const visibleRoles = roles.filter(role => (item.visible_role_ids || []).includes(role.id)).map(role => role.name);
          const card = document.createElement("button");
          card.type = "button";
          card.className = "ui-card ui-size-medium" + (editingId === item.id ? " is-selected" : "");
          card.setAttribute("aria-pressed", String(editingId === item.id));
          card.addEventListener("click", () => fillForm(item));
          const content = document.createElement("div");
          content.className = "ui-card-content";
          const title = document.createElement("h2");
          title.className = "ui-card-title";
          title.textContent = item.name || "";
          content.appendChild(title);
          const roleLine = document.createElement("div");
          roleLine.className = "ui-card-visibility";
          roleLine.textContent = visibleRoles.length ? visibleRoles.join(", ") : "None";
          content.appendChild(roleLine);
          const media = document.createElement("div");
          media.className = "ui-card-media";
          if (item.image_path) {
            const image = document.createElement("img");
            image.src = api.publicImageUrl(item.image_path);
            image.alt = "";
            image.loading = "lazy";
            media.appendChild(image);
          } else if (item.icon) {
            const glyph = document.createElement("span");
            glyph.textContent = item.icon;
            glyph.setAttribute("aria-hidden", "true");
            media.appendChild(glyph);
          } else {
            const glyph = document.createElement("span");
            glyph.className = "ui-card-svg-icon";
            const iconUrl = new URL("assets/icons/" + item.slug + ".svg", window.__3bBaseUrl || location.href).href;
            glyph.style.webkitMaskImage = 'url("' + iconUrl + '")';
            glyph.style.maskImage = 'url("' + iconUrl + '")';
            media.appendChild(glyph);
          }
          card.append(content, media);
          list.appendChild(card);
        });
      };

      const fillForm = item => {
        editingId = item.id;
        imagePath = item.image_path || null;
        slugManuallyEdited = true;
        $('[data-role="form-title"]').textContent = "Edit " + singular;
        $('[type="submit"]').textContent = "Update " + singular;
        $('[data-action="delete"]').hidden = false;
        field("name").value = item.name || "";
        field("slug").value = item.slug || "";
        field("icon").value = item.icon || "";
        visibility.select($('[data-role="visibility"]'), item.visible_role_ids || []);
        if (imagePath) {
          $('[data-role="image-preview"]').src = api.publicImageUrl(imagePath);
          $('[data-role="image-preview"]').hidden = false;
        } else {
          $('[data-role="image-preview"]').hidden = true;
        }
        status("Editing " + item.name + ".");
        $('[data-role="form-title"]').scrollIntoView({ behavior: "smooth", block: "start" });
        renderList();
      };

      const refresh = async () => {
        items = await api.listManage();
        renderList();
      };

      try {
        roles = await api.getRoles();
        visibility.render($('[data-role="visibility"]'), roles);
        await refresh();
      } catch (error) {
        status(error.message || ("Unable to load " + title + "."));
        return;
      }

      field("name").addEventListener("input", () => {
        if (!slugManuallyEdited) field("slug").value = api.toSlug(field("name").value);
      });
      field("slug").addEventListener("input", () => { slugManuallyEdited = true; });
      window.__3bComponents.imageUpload.bind({
        input: field("image"),
        preview: $('[data-role="image-preview"]'),
        upload: file => api.uploadImage(file),
        publicUrl: path => api.publicImageUrl(path),
        status,
        onUploaded: path => { imagePath = path; }
      });
      $('[data-action="cancel"]').addEventListener("click", () => {
        clearForm();
        renderList();
        status("Editing cancelled.");
      });
      $('[data-action="delete"]').addEventListener("click", async () => {
        const item = items.find(entry => entry.id === editingId);
        if (!item || !window.confirm("Delete “" + item.name + "”?")) return;
        const button = $('[data-action="delete"]');
        button.disabled = true;
        try {
          await api.remove(item.id);
          clearForm();
          await refresh();
          status(singular + " deleted.");
        } catch (error) {
          status(error.message || ("Unable to delete " + singular.toLowerCase() + "."));
        } finally {
          button.disabled = false;
        }
      });
      $('[data-role="form"]').addEventListener("submit", async event => {
        event.preventDefault();
        const button = $('[type="submit"]');
        button.disabled = true;
        status(editingId ? "Updating…" : "Saving…");
        try {
          await api.save({
            name: field("name").value,
            slug: field("slug").value,
            icon: field("icon").value,
            image_path: imagePath,
            visible_role_ids: visibility.getSelected($('[data-role="visibility"]'))
          }, editingId);
          clearForm();
          await refresh();
          status(singular + " saved successfully.");
        } catch (error) {
          status(error.message || ("Unable to save " + singular.toLowerCase() + "."));
        } finally {
          button.disabled = false;
        }
      });
    }
  };
})();
