(() => {
  "use strict";
  const loaderScript = document.currentScript;
  if (!loaderScript || loaderScript.dataset.componentsLoaded === "true") return;
  loaderScript.dataset.componentsLoaded = "true";

  const visibilityStyle = document.createElement("style");
  visibilityStyle.id = "site-initial-visibility";
  visibilityStyle.textContent = "html:not(.site-ready) body{visibility:hidden}";
  document.head.appendChild(visibilityStyle);

  const baseUrl = new URL(".", loaderScript.src);
  window.__3bBaseUrl = baseUrl;
  const resources = [
    "themes/classic/theme.js",
    "regions/region.js",
    "regions/index.js",
    "languages/language.js",
    "languages/index.js",
    "navigation.js",
    "services/intro.js",
    "components/intro.js",
    "components/item-card.js",
    "components/content-module-view.js",
    "components/visibility.js",
    "components/module-dashboard.js",
    "services/content-module.js",
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
  const mounted = new WeakMap();

  const runContext = (name, root) => {
    if (!root) return Promise.resolve();
    if (mounted.has(root)) return mounted.get(root);
    const context = window.__3bContexts?.[name];
    const task = typeof context === "function"
      ? Promise.resolve().then(() => context(root))
      : Promise.resolve();
    mounted.set(root, task);
    return task;
  };

  const mount = (name, root) => {
    if (!resourcesReady) {
      return new Promise(resolve => pending.push({ name, root, resolve }));
    }
    return runContext(name, root).catch(error => {
      console.error("[3B TECH HUB] Context failed:", error);
    });
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

  resources.reduce(
    (chain, file) => chain.then(() => loadScript(new URL(file, baseUrl).href)),
    Promise.resolve()
  )
    .then(() => Promise.all([
      window.__3bThemeReady,
      window.__3bRegionReady,
      window.__3bLanguageReady
    ]))
    .then(async () => {
      resourcesReady = true;
      const tasks = [];
      document.querySelectorAll("[data-context]").forEach(root => {
        tasks.push(runContext(root.dataset.context, root));
      });
      pending.splice(0).forEach(({ name, root, resolve }) => {
        const task = runContext(name, root);
        tasks.push(task);
        task.then(resolve, error => {
          console.error("[3B TECH HUB] Context failed:", error);
          resolve();
        });
      });
      await Promise.allSettled(tasks);
      document.documentElement.classList.add("site-ready");
      document.dispatchEvent(new Event("3b-global-loader-ready"));
    })
    .catch(error => {
      console.error("[3B TECH HUB] Site resources loading error:", error);
      document.documentElement.classList.add("site-ready");
    });
})();