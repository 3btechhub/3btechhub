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
  module.product = window.__3bServices.createContentModule({
    table: "related_products",
    storageFolder: "related-products",
    singular: "Product"
  });
  config.api = module.product;
  module.contentConfig = config;
})();
