(() => {
  "use strict";
  window.__3bModules = window.__3bModules || {};
  const module = window.__3bModules.relatedProducts = window.__3bModules.relatedProducts || {};
  module.product = window.__3bServices.createContentModule({
    table: "related_products",
    storageFolder: "related-products",
    singular: "Product"
  });
  module.contentConfig = {
    key: "relatedProducts",
    title: "Related Products",
    singular: "Product",
    plural: "Products",
    routeSegment: "product",
    api: module.product
  };
})();
