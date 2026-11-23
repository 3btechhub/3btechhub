(() => {
  "use strict";

  const loaderScript = document.currentScript;
  if (!loaderScript || loaderScript.dataset.componentsLoaded === "true") return;
  loaderScript.dataset.componentsLoaded = "true";

  const baseUrl = new URL(".", loaderScript.src);
  const componentScripts = ["navigation.js", "page-title.js"];

  const loadScript = src => new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = resolve;
    script.onerror = () => reject(new Error("Failed to load script: " + src));
    document.head.appendChild(script);
  });

  loadScript(new URL("themes/classic/theme.js", baseUrl).href)
    .then(() => window.__3bThemeReady)
    .then(() => componentScripts.reduce(
      (chain, file) => chain.then(() => loadScript(new URL(file, baseUrl).href)),
      Promise.resolve()
    ))
    .catch(error => {
      console.error("[3B TECH HUB] Site resources loading error:", error);
    });
})();
