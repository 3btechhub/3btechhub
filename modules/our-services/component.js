(() => {
  "use strict";
  window.__3bModules = window.__3bModules || {};
  const module = window.__3bModules.ourServices = window.__3bModules.ourServices || {};
  const config = module.contentConfig;
  module.renderCards = items => window.__3bComponents.contentModuleView.renderCards(items, config);
  module.renderDetails = item => window.__3bComponents.contentModuleView.renderDetails(item, config);
})();
