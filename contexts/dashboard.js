(() => {
  "use strict";
  window.__3bContexts = window.__3bContexts || {};
  window.__3bContexts.dashboard = async root => {
    if (!root) return;
    if (window.__3bAccess?.has("module.our_services.manage")) {
      await window.__3bModules?.ourServices?.mountDashboard?.(root);
    }
    if (root.dataset.introMounted === "true") return;
    root.dataset.introMounted = "true";
    if (!window.__3bAccess?.has("module.intro.manage")) return;
    const service = window.__3bIntroService;
    const supabase = window.supabaseClient;
    const style = document.createElement("style");
    style.textContent = `
      .intro-admin{width:min(100%,760px);margin:24px auto;padding:var(--padding-card);border:1px solid var(--color-border);border-radius:var(--radius-card);background:var(--color-surface);color:var(--color-text);box-shadow:var(--shadow-card)}
      .intro-admin [hidden]{display:none!important}\n      .intro-admin h2{margin:0 0 20px;font-size:20px}
      .intro-admin-field{display:grid;gap:8px;margin:16px 0}
      .intro-admin-field label,.intro-admin legend{font-weight:600;font-size:14px}
      .intro-admin input[type=text]{width:100%;min-height:var(--size-control);padding:12px 14px;border:1px solid var(--color-input-border);border-radius:var(--radius-control);background:var(--color-surface);color:var(--color-text);font:inherit}
      .intro-role-list{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px}
      .intro-role-option{display:flex;align-items:center;gap:9px;padding:10px;border:1px solid var(--color-border);border-radius:8px}
      .intro-image-preview{display:block;max-width:100%;max-height:220px;object-fit:contain;border-radius:8px}
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
      <fieldset class="intro-admin-field"><legend>Visibility</legend><div id="intro-role-list" class="intro-role-list"></div></fieldset>
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
      if (component) preview.appendChild(component);
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
      const list = $("#intro-role-list");
      if (!roles.length) {
        list.textContent = "No active roles are available.";
      } else {
        roles.forEach(role => {
          const label = document.createElement("label");
          label.className = "intro-role-option";
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
        const visibleRoleIds = [...panel.querySelectorAll("#intro-role-list input:checked")].map(input => input.value);
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
  };
})();