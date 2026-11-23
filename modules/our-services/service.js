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
  module.service = window.__3bServices.createContentModule({
    table: "our_services",
    storageFolder: "our-services",
    singular: "Service"
  });
  config.api = module.service;
  module.contentConfig = config;
})();
