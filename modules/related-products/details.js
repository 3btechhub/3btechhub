(() => {
  "use strict";
  window.__3bModules = window.__3bModules || {};
  const module = window.__3bModules.relatedProducts = window.__3bModules.relatedProducts || {};
  const config = {
    key: "relatedProducts",
    singular: "Product",
    plural: "Related Products",
    routeSegment: "product",
    api: module.product
  };
  window.__3bContexts = window.__3bContexts || {};
  window.__3bContexts.relatedProductDetails =
    root => window.__3bComponents.contentModuleView.mountDetails(root, config);
})();
