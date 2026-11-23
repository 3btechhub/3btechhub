(() => {
  "use strict";

  const loaderScript = document.currentScript;
  if (!loaderScript || loaderScript.dataset.componentsLoaded === "true") return;
  loaderScript.dataset.componentsLoaded = "true";

  const componentScripts = [
    "navigation.js",
    "page-title.js"
  ];

  const baseUrl = new URL(".", loaderScript.src);

  componentScripts.reduce((chain, file) => {
    return chain.then(() => new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = new URL(file, baseUrl).href;
      script.onload = resolve;
      script.onerror = () => reject(new Error("Failed to load component: " + file));
      document.head.appendChild(script);
    }));
  }, Promise.resolve()).catch(error => {
    console.error("[3B TECH HUB] Component loading error:", error);
  });
})();
