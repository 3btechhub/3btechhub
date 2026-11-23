(() => {
  "use strict";
  window.__3bContexts = window.__3bContexts || {};
  window.__3bContexts.home = async root => {
    if (!root) return;
    // Keep the shared navigation mounted by navigation.js.
    root.querySelectorAll(":scope > :not(#site-navigation)").forEach(element => {
      element.remove();
    });
  };
})();
