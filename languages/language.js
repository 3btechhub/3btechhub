(() => {
  "use strict";

  const storageKey = "3btechhub-language";
  const registry = new Map();
  const defaultLanguage = "en";
  let activeLanguage = defaultLanguage;

  const api = {
    register(language) {
      if (!language || typeof language.id !== "string" || !language.id.trim()) {
        throw new TypeError("[3B TECH HUB] Language must have a non-empty id.");
      }
      registry.set(language.id.toLowerCase(), Object.freeze({ ...language, id: language.id.toLowerCase() }));
      return api;
    },
    getAll() {
      return Array.from(registry.values());
    },
    get() {
      return registry.get(activeLanguage) || null;
    },
    getId() {
      return activeLanguage;
    },
    set(id) {
      const key = String(id || "").trim().toLowerCase();
      if (!registry.has(key)) return false;
      activeLanguage = key;
      localStorage.setItem(storageKey, key);
      window.dispatchEvent(new CustomEvent("3b:languagechange", { detail: api.get() }));
      return true;
    },
    translate(key) {
      const language = api.get();
      return language && language.messages && Object.prototype.hasOwnProperty.call(language.messages, key)
        ? language.messages[key]
        : key;
    },
    ready: null
  };

  const saved = localStorage.getItem(storageKey);
  if (saved) activeLanguage = saved.toLowerCase();
  window.__3bLanguage = api;
})();