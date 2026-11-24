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
    if (!link) {
      link = document.createElement("link");
      link.rel = "stylesheet";
      link.dataset.themeController = name;
      document.head.appendChild(link);
      managedStyles.set(name, link);
    }
    link.href = href;
  }

  function applyTheme() {
    const resolvedMode = getResolvedMode();
    document.documentElement.dataset.colorMode = resolvedMode;

    if (!themesBase) return;

    const base = new URL(encodeURIComponent(theme) + "/", themesBase);

    ensureStylesheet("standard", new URL("standard.css", base).href);
    ensureStylesheet("mode", new URL(resolvedMode + ".css", base).href);
    ensureStylesheet("navigation", new URL("navigation.css", base).href);
    ensureStylesheet("medium-input-box", new URL("medium-input-box.css", base).href);
    ensureStylesheet("medium-input-button", new URL("medium-input-button.css", base).href);
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

  applyTheme();
})();
