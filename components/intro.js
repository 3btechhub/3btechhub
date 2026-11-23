(() => {
  "use strict";
  window.__3bComponents = window.__3bComponents || {};
  window.__3bComponents.intro = {
    render(content, imageUrl) {
      const heading = String(content?.heading || "").trim();
      const subHeading = String(content?.sub_heading || "").trim();
      const hasImage = Boolean(imageUrl);
      if (!heading && !subHeading && !hasImage) return null;

      const section = document.createElement("section");
      section.className = "intro-component ui-section";
      section.setAttribute("aria-label", "Introduction");
      const inner = document.createElement("div");
      inner.className = "intro-component-inner page-container";

      if (heading) {
        const title = document.createElement("h2");
        title.className = "intro-heading";
        title.textContent = heading;
        inner.appendChild(title);
      }
      if (subHeading) {
        const subtitle = document.createElement("p");
        subtitle.className = "intro-sub-heading";
        subtitle.textContent = subHeading;
        inner.appendChild(subtitle);
      }
      if (hasImage) {
        const image = document.createElement("img");
        image.className = "intro-image";
        image.src = imageUrl;
        image.alt = heading || subHeading || "Introduction";
        image.loading = "lazy";
        image.decoding = "async";
        inner.appendChild(image);
      }
      section.appendChild(inner);
      return section;
    }
  };
})();