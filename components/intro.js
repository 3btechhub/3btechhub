(() => {
  "use strict";
  window.__3bComponents = window.__3bComponents || {};

  function makeTechArtwork() {
    const ns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(ns, "svg");
    svg.setAttribute("class", "intro-tech-art");
    svg.setAttribute("viewBox", "0 0 760 300");
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", "Abstract technology circuit illustration");

    const add = (tag, attrs) => {
      const node = document.createElementNS(ns, tag);
      Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, value));
      svg.appendChild(node);
      return node;
    };

    add("path", { d: "M70 150h115l32-32h72m324 0h-72l-32 32h-72M70 150h82l28 28h109m319-28h-82l-28-28H389M180 62h85l28 28h72m225-28h-85l-28 28h-72M180 238h85l28-28h72m225 28h-85l-28-28h-72", class: "intro-circuit-line" });
    add("rect", { x: "286", y: "66", width: "188", height: "168", rx: "22", class: "intro-chip" });
    add("rect", { x: "315", y: "94", width: "130", height: "112", rx: "12", class: "intro-chip-inner" });
    add("path", { d: "M345 130h70M345 150h70M345 170h42", class: "intro-chip-detail" });
    add("circle", { cx: "70", cy: "150", r: "7", class: "intro-node" });
    add("circle", { cx: "180", cy: "62", r: "7", class: "intro-node" });
    add("circle", { cx: "180", cy: "238", r: "7", class: "intro-node" });
    add("circle", { cx: "690", cy: "150", r: "7", class: "intro-node" });
    add("circle", { cx: "580", cy: "62", r: "7", class: "intro-node" });
    add("circle", { cx: "580", cy: "238", r: "7", class: "intro-node" });
    add("circle", { cx: "380", cy: "150", r: "5", class: "intro-node-center" });
    return svg;
  }

  window.__3bComponents.intro = {
    render(content, imageUrl, options = {}) {
      const heading = String(content?.heading || "").trim();
      const subHeading = String(content?.sub_heading || "").trim();
      const hasImage = Boolean(imageUrl);
      if (!heading && !subHeading && !hasImage && options.fallback !== true) return null;

      const section = document.createElement("section");
      section.className = "intro-component ui-section";
      section.setAttribute("aria-label", "Introduction");

      const card = document.createElement("article");
      card.className = "ui-large-card ui-size-large intro-card";

      const visual = document.createElement("div");
      visual.className = hasImage ? "intro-visual intro-visual-image" : "intro-visual intro-visual-tech";

      if (hasImage) {
        const image = document.createElement("img");
        image.className = "intro-image";
        image.src = imageUrl;
        image.alt = heading || subHeading || "Introduction";
        image.loading = "lazy";
        image.decoding = "async";
        visual.appendChild(image);
      } else {
        visual.appendChild(makeTechArtwork());
        const tag = document.createElement("span");
        tag.className = "intro-tech-label";
        tag.textContent = "TECHNOLOGY • INNOVATION • DIGITAL";
        visual.appendChild(tag);
      }

      card.appendChild(visual);

      if (heading || subHeading) {
        const contentArea = document.createElement("div");
        contentArea.className = "intro-card-content";
        if (heading) {
          const title = document.createElement("h2");
          title.className = "intro-heading";
          title.textContent = heading;
          contentArea.appendChild(title);
        }
        if (subHeading) {
          const subtitle = document.createElement("p");
          subtitle.className = "intro-sub-heading";
          subtitle.textContent = subHeading;
          contentArea.appendChild(subtitle);
        }
        card.appendChild(contentArea);
      }

      section.appendChild(card);
      return section;
    }
  };
})();