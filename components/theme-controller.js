(() => {
  "use strict";

  const KEY = "3btechhub-color-mode";
  const THEME = "classic";
  const MODES = ["light", "dark"];
  const script = document.currentScript;
  if (!script) return;

  const themesUrl = new URL("../themes/", script.src);

  function readMode() {
    try {
      return localStorage.getItem(KEY) === "dark" ? "dark" : "light";
    } catch {
      return "light";
    }
  }

  let mode = readMode();

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
    loadStyle("theme-colors", `${THEME}/${mode}.css`);
    document.documentElement.dataset.colorMode = mode;
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

  window.addEventListener("storage", event => {
    if (event.key === KEY) {
      mode = readMode();
      applyTheme();
    }
  });

  window.ThemeController = {
    getMode: () => mode,
    setMode
  };

  applyTheme();
})();
