(() => {
  "use strict";
  const loaderScript = document.currentScript;
  if (!loaderScript || loaderScript.dataset.componentsLoaded === "true") return;
  loaderScript.dataset.componentsLoaded = "true";
  const baseUrl = new URL(".", loaderScript.src);
  window.__3bBaseUrl = baseUrl;
  const resources = [
    "themes/classic/theme.js",
    "regions/region.js",
    "regions/index.js",
    "languages/language.js",
    "languages/index.js",
    "navigation.js",
    "page-title.js",
    "services/intro.js",
    "components/intro.js",
    "modules/our-services/service.js",
    "modules/our-services/component.js",
    "modules/our-services/home.js",
    "modules/our-services/dashboard.js",
    "modules/our-services/details.js",
    "modules/related-products/product.js",
    "modules/related-products/component.js",
    "modules/related-products/home.js",
    "modules/related-products/dashboard.js",
    "modules/related-products/details.js",
    "contexts/home.js",
    "contexts/dashboard.js"
  ];
  let resourcesReady = false;
  const pending = [];
  const mount = (name, root) => {
    if (!resourcesReady) { pending.push([name, root]); return; }
    const context = window.__3bContexts?.[name];
    if (typeof context === "function") Promise.resolve(context(root)).catch(error => console.error("[3B TECH HUB] Context failed:", error));
  };
  window.__3bMountContext = mount;
  document.addEventListener("3b-context-request", event => {
    const detail = event.detail || {};
    mount(detail.name, detail.root);
  });
  const loadScript = src => new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = resolve;
    script.onerror = () => reject(new Error("Failed to load script: " + src));
    document.head.appendChild(script);
  });
  resources.reduce((chain, file) => chain.then(() => loadScript(new URL(file, baseUrl).href)), Promise.resolve())
    .then(() => Promise.all([window.__3bThemeReady, window.__3bRegionReady, window.__3bLanguageReady]))
    .then(() => {
      resourcesReady = true;
      document.querySelectorAll("[data-context]").forEach(root => {
        mount(root.dataset.context, root);
      });
      pending.splice(0).forEach(args => mount(...args));
      document.dispatchEvent(new Event("3b-global-loader-ready"));
    })
    .catch(error => console.error("[3B TECH HUB] Site resources loading error:", error));
})();