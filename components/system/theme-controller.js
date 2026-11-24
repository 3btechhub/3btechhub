(() => {
  "use strict";

  const MODE_KEY = "3btechhub-color-mode";
  const THEME_KEY = "3btechhub-theme";
  const scriptUrl = document.currentScript?.src;
  const themesBase = scriptUrl ? new URL("../../themes/", scriptUrl) : null;
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
    const component = path => new URL("../../components/" + path, scriptUrl).href;
    const styles = [
      ["standard", new URL("standard.css", base).href],
      ["heading", new URL("heading.css", base).href],
      ["mode", new URL(getResolvedMode() + ".css", base).href],
      ["medium-input", new URL("medium-input.css", base).href],
      ["medium-output", new URL("medium-output.css", base).href],
      ["medium-button", new URL("medium-button.css", base).href],
      ["large-card", component("cards/large-card.css")],
      ["mini-card", component("cards/mini-card.css")],
      ["navigation", component("navigation/navigation.css")],
      ["login-form", component("account/login-form.css")],
      ["account-form", component("account/account-form.css")],
      ["intro-view-card", component("intro/intro-view-card.css")],
      ["intro-editor-card", component("intro/intro-editor-card.css")],
      ["services", component("services/services.css")],
      ["service-category-editor-card", component("services/service-category-editor-card.css")],
      ["media-uploader-view", component("media/media-uploader-view.css")],
      ["rbv-editor", component("visibility/rbv-editor.css")],
      ["dashboard-tabs", component("dashboard/dashboard-tabs.css")]
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
