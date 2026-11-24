(() => {
  "use strict";

  const MODE_KEY = "3btechhub-color-mode";
  const THEME_KEY = "3btechhub-theme";
  const scriptUrl = document.currentScript?.src;
  const themesBase = scriptUrl ? new URL("../themes/", scriptUrl) : null;
  const managedStyles = new Map();
  const systemPreference = window.matchMedia
    ? window.matchMedia("(prefers-color-scheme: dark)")
    : null;

  document.documentElement.dataset.themeLoading = "true";
  const loadingStyle = document.createElement("style");
  loadingStyle.textContent = 'html[data-theme-loading="true"] body{visibility:hidden}';
  document.head.appendChild(loadingStyle);

  function readStored(key, fallback) {
    try {
      return localStorage.getItem(key) || fallback;
    } catch {
      return fallback;
    }
  }

  function readMode() {
    const value = readStored(MODE_KEY, "system");
    return ["system", "light", "dark"].includes(value) ? value : "system";
  }

  function readTheme() {
    const value = readStored(THEME_KEY, "classic");
    return /^[a-z0-9-]+$/.test(value) ? value : "classic";
  }

  let mode = readMode();
  let theme = readTheme();

  function getResolvedMode() {
    if (mode === "system") {
      return systemPreference?.matches ? "dark" : "light";
    }
    return mode;
  }

  function ensureStylesheet(name, href) {
    let link = managedStyles.get(name) || document.querySelector('link[data-theme-controller="' + name + '"]');

    if (link?.href === href && link.sheet) return Promise.resolve();

    if (!link) {
      link = document.createElement("link");
      link.rel = "stylesheet";
      link.dataset.themeController = name;
      document.head.appendChild(link);
      managedStyles.set(name, link);
    }

    return new Promise(resolve => {
      const finish = () => resolve();
      link.addEventListener("load", finish, { once: true });
      link.addEventListener("error", finish, { once: true });
      link.href = href;
    });
  }

  function applyTheme(initial = false) {
    const resolvedMode = getResolvedMode();
    document.documentElement.dataset.colorMode = resolvedMode;

    if (!themesBase) {
      if (initial) {
        delete document.documentElement.dataset.themeLoading;
        document.documentElement.dataset.themeReady = "true";
      }
      return Promise.resolve();
    }

    const base = new URL(encodeURIComponent(theme) + "/", themesBase);
    const loads = [
      ensureStylesheet("standard", new URL("standard.css", base).href),
      ensureStylesheet("heading", new URL("heading.css", base).href),
      ensureStylesheet("mode", new URL(resolvedMode + ".css", base).href),
      ensureStylesheet("navigation", new URL("navigation.css", base).href),
      ensureStylesheet("medium-input", new URL("medium-input.css", base).href),
      ensureStylesheet("medium-output", new URL("medium-output.css", base).href),
      ensureStylesheet("medium-button", new URL("medium-button.css", base).href),
      ensureStylesheet("intro-view-card", new URL("intro-view-card.css", base).href),
      ensureStylesheet("intro-editor-card", new URL("intro-editor-card.css", base).href),
      ensureStylesheet("our-services", new URL("our-services.css", base).href),
      ensureStylesheet("service-category-editor-card", new URL("service-category-editor-card.css", base).href),
      ensureStylesheet("media-library", new URL("media-library.css", base).href)
    ];

    const pageForm = document.documentElement.dataset.pageForm;
    if (pageForm === "login" || pageForm === "account") {
      const stylesheetName = pageForm + "-form";
      loads.push(
        ensureStylesheet(
          stylesheetName,
          new URL(stylesheetName + ".css", base).href
        )
      );
    }

    if (initial) {
      return Promise.all(loads).finally(() => {
        delete document.documentElement.dataset.themeLoading;
        document.documentElement.dataset.themeReady = "true";
      });
    }

    return Promise.all(loads);
  }

  function setMode(value) {
    if (!["system", "light", "dark"].includes(value)) return;

    mode = value;
    try {
      localStorage.setItem(MODE_KEY, mode);
    } catch {
      // The current page still receives the selected mode.
    }
    applyTheme();
  }

  function setTheme(value) {
    if (typeof value !== "string" || !/^[a-z0-9-]+$/.test(value)) return;

    theme = value;
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      // The current page still receives the selected theme.
    }
    applyTheme();
  }

  function handleSystemPreferenceChange() {
    if (mode === "system") applyTheme();
  }

  if (systemPreference) {
    if (typeof systemPreference.addEventListener === "function") {
      systemPreference.addEventListener("change", handleSystemPreferenceChange);
    } else if (typeof systemPreference.addListener === "function") {
      systemPreference.addListener(handleSystemPreferenceChange);
    }
  }

  window.addEventListener("storage", event => {
    if (event.key === MODE_KEY) mode = readMode();
    if (event.key === THEME_KEY) theme = readTheme();
    if (event.key === MODE_KEY || event.key === THEME_KEY) applyTheme();
  });

  window.ThemeController = {
    getMode: () => mode,
    getResolvedMode,
    setMode,
    getTheme: () => theme,
    setTheme
  };

  applyTheme(true);
})();
