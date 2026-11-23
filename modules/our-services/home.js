(() => {
  "use strict";
  window.__3bModules = window.__3bModules || {};
  const module = window.__3bModules.ourServices = window.__3bModules.ourServices || {};
  module.mountHome = async root => {
    if (!root || root.dataset.ourServicesHomeMounted === "true") return;
    root.dataset.ourServicesHomeMounted = "true";
    try {
      const items = await module.service.listPublic();
      const cards = module.renderCards(items);
      if (cards) root.appendChild(cards);
    } catch (error) {
      console.error("[3B TECH HUB] Our Services could not be loaded:", error);
    }
  };
})();