(() => {
  "use strict";
  window.__3bContexts = window.__3bContexts || {};
  window.__3bContexts.serviceDetails = async root => {
    if (!root || root.dataset.serviceDetailsMounted === "true") return;
    root.dataset.serviceDetailsMounted = "true";
    const message = document.createElement("p");
    message.className = "our-service-message";
    message.textContent = "Loading service…";
    root.appendChild(message);
    try {
      const slug = new URLSearchParams(location.search).get("slug");
      if (!slug) throw new Error("Service not found.");
      const item = await window.__3bModules.ourServices.service.getPublicBySlug(slug);
      if (!item) throw new Error("Service not found or unavailable.");
      const details = window.__3bModules.ourServices.renderDetails(item);
      message.remove();
      root.appendChild(details);
      document.title = item.name + " | 3B TECH HUB";
      const title = document.getElementById("site-page-title");
      if (title) title.textContent = item.name;
    } catch (error) {
      message.textContent = error.message || "Unable to load this service.";
    }
  };
})();