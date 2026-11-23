(() => {
  "use strict";

  const script = document.currentScript;
  if (!script || window.__3bLoaderStarted) return;
  window.__3bLoaderStarted = true;

  const root = new URL(".", script.src);
  const addScript = src => new Promise((resolve, reject) => {
    const element = document.createElement("script");
    element.src = new URL(src, root).href;
    element.onload = resolve;
    element.onerror = () => reject(new Error("Could not load: " + src));
    document.head.appendChild(element);
  });

  Promise.all([
    addScript("themes/classic/theme.js"),
    addScript("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2")
  ])
    .then(() => addScript("supabase/client.js"))
    .then(() => addScript("components/navigation.js"))
    .catch(error => console.error("[3B TECH HUB] Loader failed:", error));
})();
