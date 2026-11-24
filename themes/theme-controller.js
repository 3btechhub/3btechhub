(() => {
  "use strict";

  const MODE_KEY = "3btechhub-color-mode";
  const THEME_KEY = "3btechhub-theme";
  const scriptUrl = document.currentScript?.src;
  const themesBase = scriptUrl ? new URL("./", scriptUrl) : null;
  const rootUrl = scriptUrl ? new URL("../", scriptUrl) : null;
  const managedStyles = new Map();
  const systemPreference = window.matchMedia
    ? window.matchMedia("(prefers-color-scheme: dark)")
    : null;
  let mode = readStored(MODE_KEY, "system");
  let theme = readStored(THEME_KEY, "classic");
  let applySequence = 0;

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

  function normalizeMode(value) {
    return ["system", "light", "dark"].includes(value) ? value : "system";
  }

  function normalizeTheme(value) {
    return /^[a-z0-9-]+$/.test(value || "") ? value : "classic";
  }

  mode = normalizeMode(mode);
  theme = normalizeTheme(theme);

  function getResolvedMode() {
    return mode === "system" ? (systemPreference?.matches ? "dark" : "light") : mode;
  }

  function ensureStylesheet(name, href) {
    let link = managedStyles.get(name) ||
      document.querySelector('link[data-theme-controller="' + name + '"]');

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
      link.addEventListener("error", () => {
        console.error("Stylesheet could not be loaded:", href);
        finish();
      }, { once: true });
      link.href = href;
    });
  }

  async function applyTheme(initial = false) {
    const sequence = ++applySequence;
    document.documentElement.dataset.colorMode = getResolvedMode();

    if (!themesBase || !scriptUrl) {
      if (initial) {
        delete document.documentElement.dataset.themeLoading;
        document.documentElement.dataset.themeReady = "true";
      }
      return;
    }

    const base = new URL(encodeURIComponent(theme) + "/", themesBase);
    const asset = path => new URL(path, rootUrl).href;
    const styles = [
      ["standard", new URL("standard.css", base).href],
      ["mode", new URL(getResolvedMode() + ".css", base).href],
      ["heading", asset("heading.css")],
      ["medium-input", asset("medium-input.css")],
      ["medium-output", asset("medium-output.css")],
      ["medium-button", asset("medium-button.css")],
      ["large-card", asset("cards/large-card.css")],
      ["mini-card", asset("cards/small-card.css")],
      ["navigation", asset("navigation/navigation.css")],
      ["login", asset("login/login.css")],
      ["account", asset("account/account.css")],
      ["intro-viewer", asset("intro/intro-viewer.css")],
      ["intro-editor", asset("intro/intro-editor.css")],
      ["services-viewer", asset("services/services-viewer.css")],
      ["services-editor", asset("services/services-editor.css")],
      ["media-uploader", asset("media/media-uploader.css")],
      ["rbv-viewer", asset("visibility/rbv-viewer.css")],
      ["dashboard-tabs", asset("dashboard/dashboard-tab.css")]
    ];

    await Promise.all(styles.map(([name, href]) => ensureStylesheet(name, href)));
    if (sequence !== applySequence) return;

    document.documentElement.dataset.theme = theme;
    document.documentElement.dataset.themeReady = "true";
    delete document.documentElement.dataset.themeLoading;
  }

  function persist(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.warn("Theme preference could not be saved.", error);
    }
  }

  function setMode(value) {
    mode = normalizeMode(value);
    persist(MODE_KEY, mode);
    return applyTheme();
  }

  function setTheme(value) {
    theme = normalizeTheme(value);
    persist(THEME_KEY, theme);
    document.documentElement.dataset.themeLoading = "true";
    return applyTheme();
  }

  window.addEventListener("storage", event => {
    if (event.key === MODE_KEY) {
      mode = normalizeMode(readStored(MODE_KEY, "system"));
      applyTheme();
    }
    if (event.key === THEME_KEY) {
      theme = normalizeTheme(readStored(THEME_KEY, "classic"));
      document.documentElement.dataset.themeLoading = "true";
      applyTheme();
    }
  });

  if (systemPreference?.addEventListener) {
    systemPreference.addEventListener("change", () => {
      if (mode === "system") applyTheme();
    });
  } else if (systemPreference?.addListener) {
    systemPreference.addListener(() => {
      if (mode === "system") applyTheme();
    });
  }

  window.ThemeController = {
    getMode: () => mode === "system" ? getResolvedMode() : mode,
    getModePreference: () => mode,
    setMode,
    getTheme: () => theme,
    setTheme
  };

  applyTheme(true).catch(error => {
    console.error("Theme initialization failed.", error);
    document.documentElement.dataset.themeReady = "false";
    delete document.documentElement.dataset.themeLoading;
  });
})();
