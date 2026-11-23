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
      .related-products-section{width:min(100% - (2 * var(--page-padding)),var(--content-width-section));margin:var(--space-section) auto;color:var(--color-text)}
      .related-products-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,245px),1fr));gap:var(--space-element)}
      
      .related-products-grid{grid-template-columns:repeat(auto-fit,minmax(min(100%,280px),1fr))}
      
      
      
      
      .related-product-details{width:min(100% - (2 * var(--page-padding)),var(--content-width-reading));margin:var(--space-section) auto}
      .related-product-details-image{display:block;width:100%;max-height:440px;object-fit:cover;border-radius:var(--radius-card);margin-bottom:var(--space-element)}
      .related-product-details-icon{font-size:var(--icon-size);margin-bottom:var(--space-element)}
      .related-product-details-title{margin:0 0 var(--space-element);font-size:clamp(26px,4vw,38px)}
      .related-product-back{display:inline-flex;margin-top:var(--space-element);color:var(--color-primary);font-weight:600;text-decoration:none}
      .related-product-message{width:min(100% - (2 * var(--page-padding)),var(--content-width-reading));margin:var(--space-section) auto;color:var(--color-muted);text-align:center}
      .related-products-admin{width:min(100% - (2 * var(--page-padding)),900px);margin:var(--space-section) auto}
      .related-products-admin [hidden]{display:none!important}
      .related-products-admin h2{margin:0 0 var(--space-element);font-size:var(--font-size-lg)}
      .related-products-admin-list{margin-block:var(--space-element)}
      .related-products-admin-item.is-selected{outline:2px solid var(--color-primary);outline-offset:2px}
      .related-products-admin-list .related-products-admin-tile{display:flex;align-items:center;justify-content:space-between;gap:var(--space-element);width:100%;min-height:104px;padding:16px;border:var(--border-width) solid var(--color-border);background:var(--color-surface);color:var(--color-text);font:inherit;text-align:left;cursor:pointer}
      .related-products-admin-list .related-products-admin-tile.is-selected{outline:2px solid var(--color-primary);outline-offset:2px}
      .related-products-admin-visibility-label{font-weight:600}
      .related-products-admin-visibility-value{overflow-wrap:anywhere}
      .related-products-admin-media>span:not(.ui-tile-svg-icon){display:grid;place-items:center;width:100%;height:100%;font-size:var(--icon-size);line-height:1}
      .related-products-admin-media>.ui-tile-svg-icon{flex:0 0 var(--icon-size)}
      .related-products-admin-list .ui-tile:focus-visible{outline:2px solid var(--color-primary);outline-offset:3px}
      .related-products-preview{display:block;max-width:260px;max-height:150px;object-fit:cover;border-radius:var(--radius-control)}
      
    `;
    document.head.appendChild(style);
  }

  module.renderCards = items => {
    ensureStyles();
    if (!items?.length) return null;
    const section = document.createElement("section");
    section.className = "related-products-section ui-card ui-card-medium ui-section";
    section.setAttribute("aria-label", "Related Products");
    const grid = document.createElement("div");
    grid.className = "related-products-grid";
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
    section.className = "related-product-details ui-card ui-card-medium";
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