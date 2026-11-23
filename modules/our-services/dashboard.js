(() => {
  "use strict";
  window.__3bModules = window.__3bModules || {};
  const module = window.__3bModules.ourServices = window.__3bModules.ourServices || {};
  module.mountDashboard = root => window.__3bComponents.moduleDashboard.mount(root, {
    key: "ourServices",
    title: "Our Services",
    singular: "Service",
    plural: "Services",
    api: module.service
  });
})();
