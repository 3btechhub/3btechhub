(() => {
  "use strict";

  const loaderScript = document.currentScript;
  if (!loaderScript || loaderScript.dataset.componentsLoaded === "true") return;
  loaderScript.dataset.componentsLoaded = "true";

  const baseUrl = new URL(".", loaderScript.src);
  const resources = [
    "themes/classic/theme.js",
    "regions/region.js",
    "regions/index.js",
    "languages/language.js",
    "languages/index.js",
    "navigation.js",
    "page-title.js"
  ];

  const loadScript = src => new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = resolve;
    script.onerror = () => reject(new Error("Failed to load script: " + src));
    document.head.appendChild(script);
  });

  resources.reduce((chain, file) => chain.then(() => loadScript(new URL(file, baseUrl).href)), Promise.resolve())
    .then(() => Promise.all([
      window.__3bThemeReady,
      window.__3bRegionReady,
      window.__3bLanguageReady
    ]))
    .catch(error => {
      console.error("[3B TECH HUB] Site resources loading error:", error);
    });
})();
