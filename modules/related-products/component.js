(() => {
  "use strict";
  window.__3bModules = window.__3bModules || {};
  const module = window.__3bModules.relatedProducts = window.__3bModules.relatedProducts || {};
  const product = module.product;
  const baseUrl = () => window.__3bBaseUrl || new URL("../../", document.currentScript?.src || location.href);

  function ensureStyles() {
    if (document.getElementById("related-products-styles")) return;
    const style = document.createElement("style");
    style.id = "related-products-styles";
    style.textContent = `
      
      

      
      .related-product-details-image{display:block;width:100%;height:440px;object-fit:cover;border-radius:var(--radius-card);margin-bottom:var(--space-element)}
      .related-product-details-icon{font-size:var(--icon-size);margin-bottom:var(--space-element)}
      .related-product-details-title{margin:0 0 var(--space-element);font-size:32px}
      .related-product-back{display:inline-flex;margin-top:var(--space-element);color:var(--color-primary);font-weight:600;text-decoration:none}
      .related-product-message{width:min(100% - (2 * var(--page-padding)),var(--content-width-reading));margin:var(--space-section) auto;color:var(--color-muted);text-align:center}
      
      .related-products-admin [hidden]{display:none!important}
      .related-products-admin h2{margin:0 0 var(--space-element);font-size:var(--font-size-lg)}
      .related-products-admin-list{margin-block:var(--space-element)}

      .related-products-preview{display:block;width:260px;height:150px;object-fit:cover;border-radius:var(--radius-control)}
      
    `;
    document.head.appendChild(style);
  }

  module.renderCards = items => {
    ensureStyles();
    if (!items?.length) return null;
    const section = document.createElement("section");
    section.className = "related-products-section ui-module-section ui-card ui-card-medium ui-section";
    section.setAttribute("aria-label", "Related Products");
    const grid = document.createElement("div");
    grid.className = "related-products-grid ui-item-grid";
    items.forEach(item => {
      const card = window.__3bComponents.itemCard.render({
        item,
        href: new URL("product/?slug=" + encodeURIComponent(item.slug), baseUrl()).href,
        imageUrl: item.image_path ? product.publicImageUrl(item.image_path) : "",
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
    section.className = "related-product-details ui-detail-card ui-card ui-card-medium";
    if (item.image_path) {
      const image = document.createElement("img");
      image.className = "related-product-details-image";
      image.src = product.publicImageUrl(item.image_path);
      image.alt = item.name;
      section.appendChild(image);
    } else if (item.icon) {
      const icon = document.createElement("div");
      icon.className = "related-product-details-icon";
      icon.textContent = item.icon;
      icon.setAttribute("aria-hidden", "true");
      section.appendChild(icon);
    }
    const title = document.createElement("h1");
    title.className = "related-product-details-title";
    title.textContent = item.name;
    section.appendChild(title);
    const back = document.createElement("a");
    back.className = "related-product-back";
    back.href = new URL("./", baseUrl()).href;
    back.textContent = "← Back to Home";
    section.appendChild(back);
    return section;
  };
})();