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
      ensureStylesheet("medium-input", new URL("medium-input.css", base).href),
      ensureStylesheet("medium-output", new URL("medium-output.css", base).href),
      ensureStylesheet("medium-button", new URL("medium-button.css", base).href),
      ensureStylesheet("navigation", new URL("../../components/navigation/navigation.css", scriptUrl).href),
      ensureStylesheet("large-card", new URL("../../components/cards/large-card.css", scriptUrl).href),
      ensureStylesheet("mini-card", new URL("../../components/cards/mini-card.css", scriptUrl).href),
      ensureStylesheet("login-form", new URL("../../components/account/login-form.css", scriptUrl).href),
      ensureStylesheet("account-form", new URL("../../components/account/account-form.css", scriptUrl).href),
      ensureStylesheet("intro-view-card", new URL("../../components/intro/intro-view-card.css", scriptUrl).href),
      ensureStylesheet("intro-editor-card", new URL("../../components/intro/intro-editor-card.css", scriptUrl).href),
      ensureStylesheet("our-services", new URL("../../components/services/our-services.css", scriptUrl).href),
      ensureStylesheet("service-category-editor-card", new URL("../../components/services/service-category-editor-card.css", scriptUrl).href),
      ensureStylesheet("media-uploader-view", new URL("../../components/media/media-uploader-view.css", scriptUrl).href)
    ];


