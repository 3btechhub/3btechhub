(() => {
  "use strict";
  window.__3bModules = window.__3bModules || {};
  const module = window.__3bModules.ourServices = window.__3bModules.ourServices || {};
  module.service = window.__3bServices.createContentModule({
    table: "our_services",
    storageFolder: "our-services",
    singular: "Service"
  });
  module.contentConfig = {
    key: "ourServices",
    title: "Our Services",
    singular: "Service",
    plural: "Services",
    routeSegment: "service",
    api: module.service
  };
})();
