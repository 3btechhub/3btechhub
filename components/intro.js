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

  function ensureStyles() {
    if (document.getElementById("intro-component-styles")) return;
    const style = document.createElement("style");
    style.id = "intro-component-styles";
    style.textContent = `
      .intro-component{width:min(100% - (2 * var(--page-padding)),var(--content-width-intro));margin:var(--space-section) auto}
      .intro-card{overflow:hidden;border:var(--border-width) solid var(--color-border);border-radius:var(--radius-card);background:var(--color-surface);color:var(--color-text);box-shadow:var(--shadow-card,0 12px 36px rgba(0,0,0,.12))}
      .intro-visual{position:relative;display:flex;align-items:center;justify-content:center;height:240px;overflow:hidden}
      .intro-visual-tech{background:radial-gradient(ellipse at 50% 45%,color-mix(in srgb,var(--color-primary) 18%,transparent),transparent 65%),linear-gradient(135deg,var(--color-surface),color-mix(in srgb,var(--color-primary) 9%,var(--color-surface)))}
      .intro-visual-tech::before,.intro-visual-tech::after{position:absolute;inset:0;content:"";pointer-events:none}
      .intro-visual-tech::before{background-image:linear-gradient(color-mix(in srgb,var(--color-primary) 9%,transparent) 1px,transparent 1px),linear-gradient(90deg,color-mix(in srgb,var(--color-primary) 9%,transparent) 1px,transparent 1px);background-size:28px 28px;mask-image:linear-gradient(90deg,transparent,#000 18%,#000 82%,transparent)}
      .intro-visual-tech::after{inset:12px;border:1px solid color-mix(in srgb,var(--color-primary) 18%,transparent);border-radius:12px}
      .intro-tech-art{position:relative;z-index:1;width:88%;height:270px}
      .intro-circuit-line{fill:none;stroke:var(--color-primary);stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round;opacity:.65}
      .intro-chip{fill:color-mix(in srgb,var(--color-primary) 12%,var(--color-surface));stroke:var(--color-primary);stroke-width:2.5}
      .intro-chip-inner{fill:none;stroke:var(--color-primary);stroke-width:1.5;opacity:.8}
      .intro-chip-detail{fill:none;stroke:var(--color-primary);stroke-width:4;stroke-linecap:round;opacity:.85}
      .intro-node{fill:var(--color-surface);stroke:var(--color-primary);stroke-width:3}
      .intro-node-center{fill:var(--color-primary)}
      .intro-tech-label{position:absolute;z-index:2;bottom:22px;left:0;width:100%;color:var(--color-muted);font-size:10px;font-weight:700;letter-spacing:.22em;text-align:center}
      .intro-visual-image{height:460px;background:var(--color-surface)}
      .intro-image{display:block;width:100%;height:460px;object-fit:cover}
      .intro-card-content{display:grid;justify-items:center;gap:var(--space-xs);padding:var(--padding-card);text-align:center}
      .intro-heading{margin:0;color:var(--color-text);font-size:32px;line-height:1.15}
      .intro-sub-heading{width:100%;margin:0;color:var(--color-muted);font-size:16px;line-height:var(--line-height-normal)}
    `;
    document.head.appendChild(style);
  }

  window.__3bComponents.intro = {
    render(content, imageUrl, options = {}) {
      ensureStyles();
      const heading = String(content?.heading || "").trim();
      const subHeading = String(content?.sub_heading || "").trim();
      const hasImage = Boolean(imageUrl);
      if (!heading && !subHeading && !hasImage && options.fallback !== true) return null;

      const section = document.createElement("section");
      section.className = "intro-component ui-section";
      section.setAttribute("aria-label", "Introduction");

      const card = document.createElement("article");
      card.className = "intro-card ui-section-card";

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