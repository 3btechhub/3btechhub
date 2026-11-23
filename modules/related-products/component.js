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
      .related-products-section{width:min(100% - (2 * var(--page-padding)),1120px);margin:var(--space-section) auto;color:var(--color-text)}
      .related-products-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,245px),1fr));gap:var(--space-element)}
      .related-product-tile{--ui-tile-padding:16px}
      .related-products-grid{grid-template-columns:repeat(auto-fit,minmax(min(100%,280px),1fr))}
      .related-product-tile .ui-tile-media{flex:0 0 56px}
      .related-product-details{width:min(100% - (2 * var(--page-padding)),900px);margin:var(--space-section) auto}
      .related-product-details-image{display:block;width:100%;max-height:440px;object-fit:cover;border-radius:var(--radius-card);margin-bottom:var(--space-element)}
      .related-product-details-icon{font-size:var(--icon-size);margin-bottom:var(--space-element)}
      .related-product-details-title{margin:0 0 var(--space-element);font-size:clamp(26px,4vw,38px)}
      .related-product-back{display:inline-flex;margin-top:var(--space-element);color:var(--color-primary);font-weight:600;text-decoration:none}
      .related-product-message{width:min(100% - (2 * var(--page-padding)),900px);margin:var(--space-section) auto;color:var(--color-muted);text-align:center}
      .related-products-admin{width:min(100% - (2 * var(--page-padding)),900px);margin:var(--space-section) auto}
      .related-products-admin [hidden]{display:none!important}
      .related-products-admin h2{margin:0 0 var(--space-element);font-size:1.25rem}
      .related-products-field{display:grid;gap:8px;margin:var(--space-element) 0}
      .related-products-field label,.related-products-field legend{font-size:14px;font-weight:600}
      .related-products-field input:not([type=file]):not([type=checkbox]),.related-products-field textarea,.related-products-field select{width:100%;min-height:var(--size-control);padding:12px 14px;border:var(--border-width) solid var(--color-input-border);border-radius:var(--radius-control);background:var(--color-surface);color:var(--color-text);font:inherit}
      .related-products-field textarea{min-height:calc(var(--size-control) * 2);resize:vertical}
      .related-products-role-list{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:var(--space-element)}
      .related-products-role{display:flex;align-items:center;gap:8px;padding:10px;border:var(--border-width) solid var(--color-border);border-radius:var(--radius-control)}
      .related-products-admin-list{display:grid;gap:10px;margin:var(--space-element) 0}
      .related-products-admin-item{display:flex;align-items:center;justify-content:space-between;gap:var(--space-element);padding:12px;border:var(--border-width) solid var(--color-border);border-radius:var(--radius-control)}
      .related-products-admin-actions{display:flex;flex-wrap:wrap;gap:var(--space-element)}
      .related-products-admin-actions button,.related-products-form-actions button{min-height:var(--size-control);padding:12px 18px;border:var(--border-width) solid var(--color-border);border-radius:var(--radius-control);background:var(--color-surface);color:var(--color-text);font:inherit;cursor:pointer}
      .related-products-admin-actions .danger{color:var(--color-danger)}
      .related-products-form-actions{display:flex;gap:var(--space-element);flex-wrap:wrap;margin-top:var(--space-element)}
      .related-products-form-actions .primary{border-color:transparent;background:var(--color-primary);color:var(--color-primary-text)}
      .related-products-preview{display:block;max-width:260px;max-height:150px;object-fit:cover;border-radius:var(--radius-control)}
      .related-products-status{min-height:22px;color:var(--color-muted);font-size:14px}
      @media(max-width:520px){.related-products-admin-item{align-items:flex-start;flex-direction:column}}
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
      const card = document.createElement("a");
      card.className = "related-product-tile ui-tile";
      card.href = new URL("product/?slug=" + encodeURIComponent(item.slug), baseUrl()).href;
      const media = document.createElement("div");
      media.className = "ui-tile-media";
      if (item.image_path) {
        const image = document.createElement("img");
        image.className = "";
        image.src = product.publicImageUrl(item.image_path);
        image.alt = item.name;
        image.loading = "lazy";
        image.decoding = "async";
        media.appendChild(image);
      } else {
        const icon = document.createElement("span");
        icon.className = "ui-tile-icon";
        icon.textContent = item.icon || "✦";
        icon.setAttribute("aria-hidden", "true");
        media.appendChild(icon);
      }
      const body = document.createElement("div");
      body.className = "ui-tile-content";
      const title = document.createElement("h2");
      title.className = "ui-tile-title";
      title.textContent = item.name;
      body.appendChild(title);
      card.append(media, body);
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