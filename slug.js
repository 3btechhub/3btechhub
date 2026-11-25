/**
 * Slug Generator
 * Reusable Name-to-Slug binding for any form.
 *
 * Usage:
 * 1. Load this file: <script src="/slug.js" defer></script>
 * 2. Mark the Name and Slug inputs in the same form:
 *    <input name="name" data-slug-source>
 *    <input name="slug" data-slug-target>
 *
 * A slug is generated while the user has not manually edited the slug field.
 * Once manually edited, the value is preserved when the Name field changes.
 * Clear the slug field to resume automatic generation.
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

  function resolveElement(elementOrSelector, root) {
    if (typeof elementOrSelector === "string") {
      return (root || document).querySelector(elementOrSelector);
    }
    return elementOrSelector || null;
  }

  function bind(options) {
    options = options || {};

    var nameField = resolveElement(options.nameField || options.name);
    var slugField = resolveElement(options.slugField || options.slug);

    if (!nameField || !slugField) {
      throw new Error("SlugGenerator.bind requires both nameField and slugField.");
    }

    var manuallyEdited = slugField.value.trim() !== "";

    function syncSlug() {
      if (!manuallyEdited) {
        slugField.value = createSlug(nameField.value);
        slugField.dispatchEvent(new Event("input", { bubbles: true }));
      }
    }

    function handleSlugInput() {
      manuallyEdited = slugField.value.trim() !== "";
    }

    nameField.addEventListener("input", syncSlug);
    slugField.addEventListener("input", handleSlugInput);

    // Generate an initial slug only when the slug field is empty.
    syncSlug();

    return function unbind() {
      nameField.removeEventListener("input", syncSlug);
      slugField.removeEventListener("input", handleSlugInput);
    };
  }

  function init(root) {
    root = root || document;

    var nameFields = root.querySelectorAll("[data-slug-source]");
    var unbinders = [];

    nameFields.forEach(function (nameField) {
      var form = nameField.closest("form") || root;
      var targetName = nameField.getAttribute("data-slug-target-name");
      var slugField = targetName
        ? form.querySelector('[name="' + CSS.escape(targetName) + '"]')
        : form.querySelector("[data-slug-target]");

      if (slugField) {
        unbinders.push(bind({
          nameField: nameField,
          slugField: slugField
        }));
      }
    });

    return function unbindAll() {
      unbinders.forEach(function (unbind) {
        unbind();
      });
    };
  }

  window.SlugGenerator = {
    create: createSlug,
    bind: bind,
    init: init
  };

  function start() {
    init(document);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})(window, document);
