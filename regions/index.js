(() => {
  "use strict";

  const regionFiles = ["global.js"];
  const baseUrl = new URL(".", document.currentScript.src);

  window.__3bRegionReady = regionFiles.reduce((chain, file) => chain.then(() =>
    new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = new URL(file, baseUrl).href;
      script.onload = resolve;
      script.onerror = () => reject(new Error("[3B TECH HUB] Unable to load region: " + file));
      document.head.appendChild(script);
    })
  ), Promise.resolve()).then(() => {
    const system = window.__3bRegion;
    if (!system.get()) {
      const preferred = localStorage.getItem("3btechhub-region");
      if (!preferred || !system.set(preferred)) system.set("global");
    }
    return system.get();
  });
})();