(() => {
  "use strict";

  const storageKey = "3btechhub-region";
  const registry = new Map();
  const defaultRegion = "global";
  let activeRegion = defaultRegion;

  const api = {
    register(region) {
      if (!region || typeof region.id !== "string" || !region.id.trim()) {
        throw new TypeError("[3B TECH HUB] Region must have a non-empty id.");
      }
      registry.set(region.id.toLowerCase(), Object.freeze({ ...region, id: region.id.toLowerCase() }));
      return api;
    },
    getAll() {
      return Array.from(registry.values());
    },
    get() {
      return registry.get(activeRegion) || null;
    },
    getId() {
      return activeRegion;
    },
    set(id) {
      const key = String(id || "").trim().toLowerCase();
      if (!registry.has(key)) return false;
      activeRegion = key;
      localStorage.setItem(storageKey, key);
      window.dispatchEvent(new CustomEvent("3b:regionchange", { detail: api.get() }));
      return true;
    },
    ready: null
  };

  const saved = localStorage.getItem(storageKey);
  if (saved) activeRegion = saved.toLowerCase();
  window.__3bRegion = api;
})();