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
  module.renderCards = items => window.__3bComponents.contentModuleView.renderCards(items, config);
  module.renderDetails = item => window.__3bComponents.contentModuleView.renderDetails(item, config);
})();
