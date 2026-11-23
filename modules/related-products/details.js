(() => {
  "use strict";
  window.__3bContexts = window.__3bContexts || {};
  window.__3bContexts.relatedProductDetails = async root => {
    if (!root || root.dataset.relatedProductDetailsMounted === "true") return;
    root.dataset.relatedProductDetailsMounted = "true";
    try {
      const slug = new URLSearchParams(location.search).get("slug");
      if (!slug) throw new Error("Product not found.");
      const item = await window.__3bModules.relatedProducts.product.getPublicBySlug(slug);
      if (!item) throw new Error("Product not found or unavailable.");
      const details = window.__3bModules.relatedProducts.renderDetails(item);
      root.replaceChildren(details);
      document.title = item.name + " | 3B TECH HUB";
      const title = document.getElementById("site-page-title");
      if (title) title.textContent = item.name;
    } catch (error) {
      const message = document.createElement("p");
      message.className = "related-product-message";
      message.textContent = error.message || "Unable to load this product.";
      root.replaceChildren(message);
    }
  };
})();