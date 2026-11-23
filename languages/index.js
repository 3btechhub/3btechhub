(() => {
  "use strict";

  const languageFiles = ["en.js"];
  const baseUrl = new URL(".", document.currentScript.src);

  window.__3bLanguageReady = languageFiles.reduce((chain, file) => chain.then(() =>
    new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = new URL(file, baseUrl).href;
      script.onload = resolve;
      script.onerror = () => reject(new Error("[3B TECH HUB] Unable to load language: " + file));
      document.head.appendChild(script);
    })
  ), Promise.resolve()).then(() => {
    const system = window.__3bLanguage;
    const preferred = localStorage.getItem("3btechhub-language");
    if (!preferred || !system.set(preferred)) system.set("en");
    return system.get();
  });
})();