(() => {
  "use strict";
  window.__3bModules = window.__3bModules || {};
  const module = window.__3bModules.relatedProducts = window.__3bModules.relatedProducts || {};
  module.mountDashboard = root => window.__3bComponents.moduleDashboard.mount(root, {
    key: "relatedProducts",
    title: "Related Products",
    singular: "Product",
    plural: "Products",
    api: module.product
  });
})();
