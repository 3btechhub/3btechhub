(() => {
  "use strict";

  const root = document.documentElement;
  const storageKey = "3btechhub-theme-mode";
  const media = window.matchMedia("(prefers-color-scheme: dark)");

  const getMode = () => {
    const saved = localStorage.getItem(storageKey);
    return saved === "light" || saved === "dark"
      ? saved
      : (media.matches ? "dark" : "light");
  };

  const applyMode = mode => {
    root.dataset.theme = mode;
    const button = document.getElementById("theme-mode-toggle");
    if (button) {
      button.textContent = mode === "dark" ? "☀" : "☾";
      button.setAttribute("aria-label", mode === "dark" ? "Switch to light mode" : "Switch to dark mode");
      button.setAttribute("title", mode === "dark" ? "Light mode" : "Dark mode");
    }
  };

  const scriptUrl = document.currentScript.src;
  const themeBase = new URL(".", scriptUrl);
  const addStylesheet = name => new Promise((resolve, reject) => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = new URL(name, themeBase).href;
    link.onload = resolve;
    link.onerror = () => reject(new Error("Unable to load Classic theme stylesheet: " + name));
    document.head.appendChild(link);
  });

  applyMode(getMode());

  window.__3bThemeReady = Promise.all([
    addStylesheet("light.css"),
    addStylesheet("dark.css")
  ]).then(() => {
    const toggle = document.createElement("button");
    toggle.id = "theme-mode-toggle";
    toggle.type = "button";
    toggle.className = "theme-mode-toggle";
    toggle.addEventListener("click", () => {
      const next = root.dataset.theme === "dark" ? "light" : "dark";
      localStorage.setItem(storageKey, next);
      applyMode(next);
    });
    document.body.appendChild(toggle);
    applyMode(root.dataset.theme);

    media.addEventListener?.("change", event => {
      if (!localStorage.getItem(storageKey)) applyMode(event.matches ? "dark" : "light");
    });
  });
})();
