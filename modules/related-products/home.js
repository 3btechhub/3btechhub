(() => {
  "use strict";
  window.__3bModules = window.__3bModules || {};
  const module = window.__3bModules.relatedProducts = window.__3bModules.relatedProducts || {};
  module.mountHome = async root => {
    if (!root || root.dataset.relatedProductsHomeMounted === "true") return;
    root.dataset.relatedProductsHomeMounted = "true";
    try {
      const items = await module.product.listPublic();
      const cards = module.renderCards(items);
      if (cards) root.appendChild(cards);
    } catch (error) {
      console.error("[3B TECH HUB] Related Products could not be loaded:", error);
    }
  };
})();