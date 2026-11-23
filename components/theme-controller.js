(() => {
  "use strict";

  const KEY = "3btechhub-color-mode";
  const THEME = "classic";
  const MODES = ["system", "light", "dark"];
  const script = document.currentScript;
  if (!script) return;

  const themesUrl = new URL("../themes/", script.src);

  function readMode() {
    try {
      const saved = localStorage.getItem(KEY);
      return MODES.includes(saved) ? saved : "system";
    } catch {
      return "system";
    }
  }

  let mode = readMode();
  const systemMode = matchMedia("(prefers-color-scheme: dark)");

  function getEffectiveMode() {
    return mode === "system"
      ? systemMode.matches ? "dark" : "light"
      : mode;
  }

  function loadStyle(id, file) {
    const href = new URL(file, themesUrl).href;
    let link = document.getElementById(id);

    if (link?.href === href) return;

    link?.remove();
    link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = href;
    document.head.appendChild(link);
  }

  function applyTheme() {
    loadStyle("theme-standard", `${THEME}/standard.css`);
    loadStyle("theme-colors", `${THEME}/${getEffectiveMode()}.css`);
    document.documentElement.dataset.colorMode = getEffectiveMode();
  }

  function setMode(value) {
    if (!MODES.includes(value)) return;

    mode = value;
    try {
      localStorage.setItem(KEY, mode);
    } catch {
      // Theme selection still works for this page.
    }
    applyTheme();
  }

  systemMode.addEventListener("change", () => {
    if (mode === "system") applyTheme();
  });

  window.addEventListener("storage", event => {
    if (event.key === KEY) {
      mode = readMode();
      applyTheme();
    }
  });

  window.ThemeController = {
    getMode: () => mode,
    getEffectiveMode,
    setMode
  };

  applyTheme();
})();
