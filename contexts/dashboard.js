(() => {
  "use strict";
  window.__3bContexts = window.__3bContexts || {};
  window.__3bContexts.dashboard = async root => {
    if (!root) return;
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
    const panel = document.createElement("section");
    panel.className = "intro-admin ui-section-card ui-admin-panel";
    panel.innerHTML = `
      <h2>Intro — Home Component</h2>
      <div class="ui-form-field"><label class="ui-form-label" for="intro-heading">Heading</label><input id="intro-heading" class="ui-input" type="text" maxlength="180" autocomplete="off"></div>
      <div class="ui-form-field"><label class="ui-form-label" for="intro-sub-heading">Sub Heading</label><input id="intro-sub-heading" class="ui-input" type="text" maxlength="300" autocomplete="off"></div>
      <div class="ui-form-field"><label class="ui-form-label" for="intro-visual-type">Card Design</label><select id="intro-visual-type" class="ui-select"><option value="default">Default Technology Card</option><option value="image">Uploaded Image</option></select></div>
      <div class="ui-form-field" id="intro-image-field"><label class="ui-form-label" for="intro-image">Select Image</label><input id="intro-image" class="ui-input" type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif"><img id="intro-image-preview" class="intro-image-preview" alt="Intro image preview" hidden></div>
      <div class="ui-form-field"><label class="ui-form-label">Visibility</label><div id="ui-visibility-list" class="ui-visibility-list"></div></div>
      <button id="intro-save" class="ui-button ui-button-primary" type="button">Save Intro</button>
      <p id="intro-status" class="ui-status" role="status" aria-live="polite"></p><div class="ui-admin-preview"><h2>Home Preview</h2><div id="intro-preview"></div></div>
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
      window.__3bComponents.visibility.render($("#ui-visibility-list"), roles, content?.visible_role_ids || []);
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
        const visibleRoleIds = window.__3bComponents.visibility.getSelected($("#ui-visibility-list"));
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