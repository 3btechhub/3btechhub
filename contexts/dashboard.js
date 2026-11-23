(() => {
  "use strict";
  window.__3bContexts = window.__3bContexts || {};
  window.__3bContexts.dashboard = async root => {
    if (!root) return;
    if (!document.getElementById("dashboard-section-spacing")) {
      const spacing = document.createElement("style");
      spacing.id = "dashboard-section-spacing";
      spacing.textContent = `.ui-dashboard-sections{display:flex;flex-direction:column;gap:var(--space-section)}.ui-dashboard-sections>section{margin-block:0}`;
      document.head.appendChild(spacing);
    }
    root.classList.add("ui-dashboard-sections");
    if (root.dataset.introMounted === "true") {
      if (window.__3bAccess?.has("module.our_services.manage")) await window.__3bModules?.ourServices?.mountDashboard?.(root);
      if (window.__3bAccess?.has("module.related_products.manage")) await window.__3bModules?.relatedProducts?.mountDashboard?.(root);
      return;
    }
    root.dataset.introMounted = "true";
    if (!window.__3bAccess?.has("module.intro.manage")) {
      await window.__3bModules?.ourServices?.mountDashboard?.(root);
      await window.__3bModules?.relatedProducts?.mountDashboard?.(root);
      return;
    }
    const service = window.__3bIntroService;
    const supabase = window.supabaseClient;
    const style = document.createElement("style");
    style.textContent = `
      .intro-admin{width:min(100%,760px);margin:var(--space-section) auto;padding:var(--padding-card);border:var(--border-width) solid var(--color-border);border-radius:var(--radius-card);background:var(--color-surface);color:var(--color-text);box-shadow:var(--shadow-card)}
      .intro-admin [hidden]{display:none!important}\n      .intro-admin h2{margin:0 0 var(--space-lg);font-size:var(--font-size-lg)}
      .intro-admin-field{display:grid;gap:var(--space-xs);margin:var(--space-element) 0}
      .intro-admin-field label,.intro-admin legend{font-weight:600;font-size:14px}
      .intro-admin input[type=text]{width:100%;min-height:var(--size-control);padding:var(--space-sm) 14px;border:var(--border-width) solid var(--color-input-border);border-radius:var(--radius-control);background:var(--color-surface);color:var(--color-text);font:inherit}
      .intro-image-preview{display:block;max-width:100%;max-height:220px;object-fit:contain;border-radius:var(--radius-control)}
      .intro-admin-preview{display:flex;flex-direction:column;gap:var(--space-element);margin-top:var(--space-section)}
      .intro-admin-preview #intro-preview{width:100%}
      .intro-admin-preview #intro-preview>.intro-component{width:100%;margin:0;cursor:pointer}\n      .intro-admin-preview #intro-preview>.intro-component:focus-visible{outline:2px solid var(--color-primary);outline-offset:4px;border-radius:var(--radius-card)}
      .intro-admin-status{min-height:22px;color:var(--color-muted);font-size:14px}
    `;
    document.head.appendChild(style);
    const panel = document.createElement("section");
    panel.className = "intro-admin";
    panel.innerHTML = `
      <h2>Intro — Home Component</h2>
      <div class="intro-admin-field"><label for="intro-heading">Heading</label><input id="intro-heading" type="text" maxlength="180" autocomplete="off"></div>
      <div class="intro-admin-field"><label for="intro-sub-heading">Sub Heading</label><input id="intro-sub-heading" type="text" maxlength="300" autocomplete="off"></div>
      <div class="intro-admin-field"><label for="intro-visual-type">Card Design</label><select id="intro-visual-type"><option value="default">Default Technology Card</option><option value="image">Uploaded Image</option></select></div>
      <div class="intro-admin-field" id="intro-image-field"><label for="intro-image">Select Image</label><input id="intro-image" type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif"><img id="intro-image-preview" class="intro-image-preview" alt="Intro image preview" hidden></div>
      <div class="intro-admin-field"><label>Visibility</label><div id="ui-visibility-list" class="ui-visibility-list"></div></div>
      <button id="intro-save" class="ui-button ui-button-primary" type="button">Save Intro</button>
      <p id="intro-status" class="intro-admin-status" role="status" aria-live="polite"></p><div class="intro-admin-preview"><h2>Home Preview</h2><div id="intro-preview"></div></div>
    `;
    root.appendChild(panel);
    const $ = selector => panel.querySelector(selector);
    const status = message => { $("#intro-status").textContent = message; };
    let imagePath = null;
    let currentContent = null;
    const renderPreview = content => {
      const preview = $("#intro-preview");
      preview.replaceChildren();
      const component = window.__3bComponents?.intro?.render(content || {}, service.publicImageUrl(content?.image_path), { fallback: true });
      if (component) {
        component.setAttribute("role", "button");
        component.setAttribute("tabindex", "0");
        component.setAttribute("aria-label", "Edit Intro preview");
        const activateEdit = () => {
          status("Editing Intro.");
          $("#intro-heading").focus({ preventScroll: true });
          $("#intro-heading").scrollIntoView({ behavior: "smooth", block: "center" });
        };
        component.addEventListener("click", activateEdit);
        component.addEventListener("keydown", event => {
          if (event.key !== "Enter" && event.key !== " ") return;
          event.preventDefault();
          activateEdit();
        });
        preview.appendChild(component);
      }
    };
    try {
      const [roles, content] = await Promise.all([service.getRoles(), service.getContent()]);
      currentContent = content || {};
      imagePath = content?.image_path || null;
      $("#intro-visual-type").value = imagePath ? "image" : "default";
      $("#intro-image-field").hidden = !imagePath;
      $("#intro-heading").value = content?.heading || "";
      $("#intro-sub-heading").value = content?.sub_heading || "";
      if (imagePath) {
        $("#intro-image-preview").src = service.publicImageUrl(imagePath);
        $("#intro-image-preview").hidden = false;
      }
      renderPreview(currentContent);
      const selected = new Set(content?.visible_role_ids || []);
      const list = $("#ui-visibility-list");
      if (!roles.length) {
        list.textContent = "No active roles are available.";
      } else {
        roles.forEach(role => {
          const label = document.createElement("label");
          label.className = "ui-visibility-option";
          const checkbox = document.createElement("input");
          checkbox.type = "checkbox";
          checkbox.value = role.id;
          checkbox.checked = selected.has(role.id);
          const name = document.createElement("span");
          name.textContent = role.name;
          label.append(checkbox, name);
          list.appendChild(label);
        });
      }
    } catch (error) {
      status(error.message || "Unable to load Intro settings.");
      return;
    }

    $("#intro-visual-type").addEventListener("change", event => {
      const useImage = event.target.value === "image";
      $("#intro-image-field").hidden = !useImage;
      if (!useImage) {
        imagePath = null;
        $("#intro-image-preview").hidden = true;
      }
      renderPreview({
        heading: $("#intro-heading").value,
        sub_heading: $("#intro-sub-heading").value,
        image_path: imagePath
      });
    });

    $("#intro-image").addEventListener("change", async event => {
      const file = event.target.files?.[0];
      if (!file) return;
      $("#intro-visual-type").value = "image";
      $("#intro-image-field").hidden = false;
      try {
        status("Uploading image…");
        imagePath = await service.uploadImage(file);
        $("#intro-image-preview").src = service.publicImageUrl(imagePath);
        $("#intro-image-preview").hidden = false;
        renderPreview({ heading: $("#intro-heading").value, sub_heading: $("#intro-sub-heading").value, image_path: imagePath });
        status("Image uploaded. Save to apply it.");
      } catch (error) {
        status(error.message || "Image upload failed.");
        event.target.value = "";
      }
    });

    $("#intro-save").addEventListener("click", async () => {
      const button = $("#intro-save");
      button.disabled = true;
      status("Saving…");
      try {
        const visibleRoleIds = [...panel.querySelectorAll("#ui-visibility-list input:checked")].map(input => input.value);
        await service.saveContent({
          heading: $("#intro-heading").value,
          sub_heading: $("#intro-sub-heading").value,
          image_path: imagePath,
          visible_role_ids: visibleRoleIds
        });
        currentContent = { heading: $("#intro-heading").value, sub_heading: $("#intro-sub-heading").value, image_path: $("#intro-visual-type").value === "image" ? imagePath : null, visible_role_ids: visibleRoleIds };
        renderPreview(currentContent);
        status("Intro saved successfully.");
      } catch (error) {
        status(error.message || "Unable to save Intro.");
      } finally {
        button.disabled = false;
      }
    });
    if (window.__3bAccess?.has("module.our_services.manage")) await window.__3bModules?.ourServices?.mountDashboard?.(root);
    if (window.__3bAccess?.has("module.related_products.manage")) await window.__3bModules?.relatedProducts?.mountDashboard?.(root);
  };
})();