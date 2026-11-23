(() => {
  "use strict";

  const MODE_KEY = "3btechhub-color-mode";
  const THEME_KEY = "3btechhub-theme";
  const scriptUrl = document.currentScript?.src;
  const themesBase = scriptUrl ? new URL("../themes/", scriptUrl) : null;
  const managedStyles = new Map();

  function readStored(key, fallback) {
    try {
      return localStorage.getItem(key) || fallback;
    } catch {
      return fallback;
    }
  }

  function readMode() {
    return readStored(MODE_KEY, "light") === "dark" ? "dark" : "light";
  }

  function readTheme() {
    const value = readStored(THEME_KEY, "classic");
    return /^[a-z0-9-]+$/.test(value) ? value : "classic";
  }

  let mode = readMode();
  let theme = readTheme();

  function ensureStylesheet(name, href) {
    let link = managedStyles.get(name);
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
    document.documentElement.dataset.colorMode = mode;
    if (!themesBase) return;

    const base = new URL(encodeURIComponent(theme) + "/", themesBase);
    ensureStylesheet("standard", new URL("standard.css", base).href);
    ensureStylesheet("mode", new URL(mode + ".css", base).href);
  }

  function setMode(value) {
    if (value !== "light" && value !== "dark") return;
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

  window.addEventListener("storage", event => {
    if (event.key === MODE_KEY) mode = readMode();
    if (event.key === THEME_KEY) theme = readTheme();
    if (event.key === MODE_KEY || event.key === THEME_KEY) applyTheme();
  });

  window.ThemeController = {
    getMode: () => mode,
    setMode,
    getTheme: () => theme,
    setTheme
  };

  applyTheme();
})();
