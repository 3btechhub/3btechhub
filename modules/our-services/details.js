(() => {
  "use strict";
  window.__3bModules = window.__3bModules || {};
  const module = window.__3bModules.ourServices = window.__3bModules.ourServices || {};
  const config = {
    key: "ourServices",
    singular: "Service",
    plural: "Our Services",
    routeSegment: "service",
    api: module.service
  };
  window.__3bContexts = window.__3bContexts || {};
  window.__3bContexts.serviceDetails =
    root => window.__3bComponents.contentModuleView.mountDetails(root, config);
})();
