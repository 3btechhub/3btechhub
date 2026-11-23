(() => {
  "use strict";

  const KEY = "3btechhub-color-mode";

  function readMode() {
    try {
      return localStorage.getItem(KEY) === "dark" ? "dark" : "light";
    } catch {
      return "light";
    }
  }

  let mode = readMode();

  function applyTheme() {
    document.documentElement.dataset.colorMode = mode;
  }

  function setMode(value) {
    if (value !== "light" && value !== "dark") return;

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
