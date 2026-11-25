/**
 * Reusable Name-to-Slug generator.
 * Users can edit the generated slug; clearing it resumes auto-generation.
 */
(function (window, document) {
  "use strict";

  function createSlug(value) {
    return String(value == null ? "" : value)
      .normalize("NFKC")
      .toLowerCase()
      .trim()
      .replace(/[^\p{L}\p{N}]+/gu, "-")
      .replace(/^-+|-+$/g, "");
  }

  function resolveElement(value, root) {
    if (typeof value === "string") return (root || document).querySelector(value);
    return value || null;
  }

  function bind(options) {
    options = options || {};
    var nameField = resolveElement(options.nameField || options.name);
    var slugField = resolveElement(options.slugField || options.slug);
    if (!nameField || !slugField) {
      throw new Error("SlugGenerator.bind requires both nameField and slugField.");
    }

    var manuallyEdited = false;
    var syncing = false;

    function syncSlug() {
      if (manuallyEdited) return;
      syncing = true;
      slugField.value = createSlug(nameField.value);
      slugField.dispatchEvent(new Event("input", { bubbles: true }));
      syncing = false;
    }

    function handleSlugInput() {
      if (!syncing) manuallyEdited = slugField.value.trim() !== "";
    }

    nameField.addEventListener("input", syncSlug);
    slugField.addEventListener("input", handleSlugInput);
    syncSlug();

    return function unbind() {
      nameField.removeEventListener("input", syncSlug);
      slugField.removeEventListener("input", handleSlugInput);
    };
  }

  function init(root) {
    root = root || document;
    var unbinders = [];
    root.querySelectorAll("[data-slug-source]").forEach(function (nameField) {
      var form = nameField.closest("form") || root;
      var targetName = nameField.getAttribute("data-slug-target-name");
      var slugField = targetName
        ? form.querySelector('[name="' + CSS.escape(targetName) + '"]')
        : form.querySelector("[data-slug-target]");
      if (slugField) unbinders.push(bind({ nameField: nameField, slugField: slugField }));
    });
    return function unbindAll() {
      unbinders.forEach(function (unbind) { unbind(); });
    };
  }

  window.SlugGenerator = { create: createSlug, bind: bind, init: init };
  function start() { init(document); }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})(window, document);
