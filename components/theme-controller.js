/* Central theme controller.
 * Pages and components load this controller without naming a specific theme.
 */
(() => {
  "use strict";

  const STORAGE_KEY = "3btechhub-color-mode";
  const ACTIVE_THEME = "classic";
  const VALID_MODES = ["system", "light", "dark"];

  const script = document.currentScript ||
    document.querySelector('script[src$="/components/theme-controller.js"]');
  if (!script) return;

  const siteRoot = new URL("../", script.src);
  const themesRoot = new URL("themes/", siteRoot);

  let selectedMode = readSavedMode();
  let systemQuery = window.matchMedia("(prefers-color-scheme: dark)");

  function readSavedMode() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return VALID_MODES.includes(saved) ? saved : "system";
    } catch {
      return "system";
    }
  }

  function getEffectiveMode() {
    if (selectedMode === "system") {
      return systemQuery.matches ? "dark" : "light";
    }
    return selectedMode;
  }

  function loadStylesheet(id, href) {
    return new Promise(resolve => {
      let link = document.getElementById(id);
      if (link && link.href === href) {
        resolve();
        return;
      }
      if (link) link.remove();

      link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href = href;
      link.onload = () => resolve();
      link.onerror = () => resolve();
      document.head.appendChild(link);
    });
  }

  async function applyTheme() {
    const standardUrl = new URL(`${ACTIVE_THEME}/standard.css`, themesRoot).href;
    const modeUrl = new URL(`${ACTIVE_THEME}/${getEffectiveMode()}.css`, themesRoot).href;

    await Promise.all([
      loadStylesheet("site-theme-standard", standardUrl),
      loadStylesheet("site-theme-mode", modeUrl)
    ]);

    document.documentElement.dataset.theme = "active";
    document.documentElement.dataset.colorMode = getEffectiveMode();
  }

  function setMode(mode) {
    if (!VALID_MODES.includes(mode)) {
      throw new TypeError('Mode must be "system", "light", or "dark".');
    }

    selectedMode = mode;
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      // The current page still applies the selected mode if storage is unavailable.
    }
    applyTheme();
  }

  systemQuery.addEventListener("change", () => {
    if (selectedMode === "system") applyTheme();
  });

  window.addEventListener("storage", event => {
    if (event.key === STORAGE_KEY) {
      selectedMode = readSavedMode();
      applyTheme();
    }
  });

  window.ThemeController = Object.freeze({
    getMode: () => selectedMode,
    getEffectiveMode,
    setMode
  });

  applyTheme();
})();
