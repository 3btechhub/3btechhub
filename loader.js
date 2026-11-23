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

  const protectPrivatePage = async () => {
    const path = window.location.pathname.replace(/\/+$/, "");
    const protectedPage = /\/account$/.test(path) || /\/dashboard$/.test(path);
    if (!protectedPage) return;

    const loginUrl = new URL("login/", root);
    loginUrl.searchParams.set("next", window.location.pathname + window.location.search + window.location.hash);

    try {
      const supabase = window.supabaseClient;
      if (!supabase) throw new Error("Authentication client unavailable");
      const { data, error } = await supabase.auth.getSession();
      if (error || !data.session) {
        window.location.replace(loginUrl.href);
        return;
      }

      supabase.auth.onAuthStateChange((event, session) => {
        if (event === "SIGNED_OUT" || !session) {
          window.location.replace(loginUrl.href);
        }
      });
    } catch (error) {
      console.error("[3B TECH HUB] Private page authentication check failed:", error);
      window.location.replace(loginUrl.href);
    }
  };

  Promise.all([
    addScript("themes/classic/theme.js"),
    addScript("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2")
  ])
    .then(() => addScript("supabase/client.js"))
    .then(protectPrivatePage)
    .then(() => addScript("components/navigation.js"))
    .catch(error => console.error("[3B TECH HUB] Loader failed:", error));
})();