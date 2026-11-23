(() => {
  "use strict";
  window.__3bModules = window.__3bModules || {};
  const module = window.__3bModules.ourServices = window.__3bModules.ourServices || {};
  const service = module.service;
  const baseUrl = () => window.__3bBaseUrl || new URL("../../", document.currentScript?.src || location.href);

  function ensureStyles() {
    if (document.getElementById("our-services-styles")) return;
    const style = document.createElement("style");
    style.id = "our-services-styles";
    style.textContent = `
      .our-services-section{width:min(100% - (2 * var(--page-padding)),var(--content-width-section));margin:var(--space-section) auto;color:var(--color-text)}
      .our-services-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,280px),1fr));gap:var(--space-element)}

      .our-service-details{width:min(100% - (2 * var(--page-padding)),var(--content-width-reading));margin:var(--space-section) auto}
      .our-service-details-image{display:block;width:100%;max-height:440px;object-fit:cover;border-radius:var(--radius-card);margin-bottom:var(--space-element)}
      .our-service-details-icon{font-size:var(--icon-size);margin-bottom:var(--space-element)}
      .our-service-details-title{margin:0 0 var(--space-element);font-size:clamp(26px,4vw,38px)}
      .our-service-back{display:inline-flex;margin-top:var(--space-element);color:var(--color-primary);font-weight:600;text-decoration:none}
      .our-service-message{width:min(100% - (2 * var(--page-padding)),var(--content-width-reading));margin:var(--space-section) auto;color:var(--color-muted);text-align:center}
      .our-services-admin{width:min(100% - (2 * var(--page-padding)),var(--content-width-reading));margin:var(--space-section) auto}
      .our-services-admin [hidden]{display:none!important}
      .our-services-admin h2{margin:0 0 var(--space-element);font-size:var(--font-size-lg)}
      .our-services-admin-list{margin-block:var(--space-element)}

      .our-services-preview{display:block;max-width:260px;max-height:150px;object-fit:cover;border-radius:var(--radius-control)}
      
    `;
    document.head.appendChild(style);
  }

  module.renderCards = items => {
    ensureStyles();
    if (!items?.length) return null;
    const section = document.createElement("section");
    section.className = "our-services-section ui-card ui-card-medium ui-section";
    section.setAttribute("aria-label", "Our Services");
    const grid = document.createElement("div");
    grid.className = "our-services-grid";
    items.forEach(item => {
      const card = window.__3bComponents.itemCard.render({
        item,
        href: new URL("service/?slug=" + encodeURIComponent(item.slug), baseUrl()).href,
        imageUrl: item.image_path ? service.publicImageUrl(item.image_path) : "",
        icon: item.icon || "",
        iconUrl: !item.image_path && !item.icon ? new URL("assets/icons/" + item.slug + ".svg", baseUrl()).href : ""
      });
      grid.appendChild(card);
    });
    section.appendChild(grid);
    return section;
  };

  module.renderDetails = item => {
    ensureStyles();
    const section = document.createElement("article");
    section.className = "our-service-details ui-card ui-card-medium";
    if (item.image_path) {
      const image = document.createElement("img");
      image.className = "our-service-details-image";
      image.src = service.publicImageUrl(item.image_path);
      image.alt = item.name;
      section.appendChild(image);
    } else if (item.icon) {
      const icon = document.createElement("div");
      icon.className = "our-service-details-icon";
      icon.textContent = item.icon;
      icon.setAttribute("aria-hidden", "true");
      section.appendChild(icon);
    }
    const title = document.createElement("h1");
    title.className = "our-service-details-title";
    title.textContent = item.name;
    section.appendChild(title);
    const back = document.createElement("a");
    back.className = "our-service-back";
    back.href = new URL("./", baseUrl()).href;
    back.textContent = "← Back to Home";
    section.appendChild(back);
    return section;
  };
})();