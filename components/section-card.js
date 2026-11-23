(() => {
  "use strict";
  window.__3bComponents = window.__3bComponents || {};

  window.__3bComponents.sectionCard = {
    render({ tag = "section", size = "medium", className = "", ariaLabel = "", children = [] } = {}) {
      const allowedSizes = new Set(["small", "medium", "large"]);
      const allowedTags = new Set(["section", "article", "div"]);
      const element = document.createElement(allowedTags.has(tag) ? tag : "section");
      const normalizedSize = allowedSizes.has(size) ? size : "medium";
      element.className = ["ui-section-card", "ui-size-" + normalizedSize, className]
        .filter(Boolean).join(" ");
      if (ariaLabel) element.setAttribute("aria-label", ariaLabel);
      const nodes = Array.isArray(children) ? children : [children];
      nodes.filter(node => node instanceof Node).forEach(node => element.appendChild(node));
      return element;
    }
  };
})();