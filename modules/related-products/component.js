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
      .related-product-tile{display:flex;align-items:center;justify-content:space-between;gap:var(--space-element);min-height:104px}
      .related-product-tile .ui-tile-content{min-width:0}
      .related-product-tile-media{display:flex;flex:0 0 56px;width:56px;height:56px;align-items:center;justify-content:center;overflow:hidden;border-radius:var(--radius-control);background:color-mix(in srgb,var(--color-primary) 9%,var(--color-surface));}
      .related-product-tile-media img{width:100%;height:100%;object-fit:cover}
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
      .related-products-admin-item{display:grid;grid-template-columns:minmax(0,1fr) minmax(180px,auto);align-items:center;justify-content:space-between;gap:var(--space-element);width:100%;padding:14px 16px;border:var(--border-width) solid var(--color-border);border-radius:var(--radius-control);background:var(--color-surface);color:var(--color-text);font:inherit;text-align:left;cursor:pointer}
      .related-products-admin-item.is-selected{outline:2px solid var(--color-primary);outline-offset:2px}
      .related-products-admin-meta{display:flex;flex-wrap:wrap;gap:var(--space-element);margin-top:var(--space-element);color:var(--color-muted);font-size:13px}
      .related-products-admin-list .related-products-admin-tile{display:flex;align-items:center;justify-content:space-between;gap:var(--space-element);width:100%;min-height:104px;padding:16px;border:var(--border-width) solid var(--color-border);background:var(--color-surface);color:var(--color-text);font:inherit;text-align:left;cursor:pointer}
      .related-products-admin-list .related-products-admin-tile.is-selected{outline:2px solid var(--color-primary);outline-offset:2px}
      .related-products-admin-content{display:grid;gap:8px;min-width:0}
      .related-products-admin-content .ui-tile-title{margin:0}
      .related-products-admin-visibility{display:grid;gap:3px;color:var(--color-muted);font-size:13px}
      .related-products-admin-visibility-label{font-weight:600}
      .related-products-admin-visibility-value{overflow-wrap:anywhere}
      .related-products-admin-media{display:flex;flex:0 0 76px;width:76px;height:76px;align-items:center;justify-content:center;overflow:hidden;border-radius:var(--radius-control);background:color-mix(in srgb,var(--color-primary) 9%,var(--color-surface));}
      .related-products-admin-media{margin-left:auto;justify-self:end}
      .related-products-admin-media img{width:100%;height:100%;object-fit:cover}
      .related-products-admin-media>span:not(.ui-tile-svg-icon){display:grid;place-items:center;width:100%;height:100%;font-size:var(--icon-size);line-height:1}
      .related-products-admin-media>.ui-tile-svg-icon{flex:0 0 var(--icon-size)}
      .related-products-admin-tile:focus-visible{outline:2px solid var(--color-primary);outline-offset:3px}
      .related-products-admin-list .ui-tile:focus-visible{outline:2px solid var(--color-primary);outline-offset:3px}
      .related-products-admin-identity{min-width:0}
      .related-products-admin-slug{color:var(--color-muted);font-size:13px;overflow-wrap:anywhere}
      .related-products-admin-meta{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:var(--space-element);color:var(--color-muted);font-size:13px;text-align:right}
      .related-products-admin-item:focus-visible{outline:2px solid var(--color-primary);outline-offset:2px}
      .related-products-admin-actions{display:flex;flex-wrap:wrap;gap:var(--space-element)}
      .related-products-admin-actions button,.related-products-form-actions button{min-height:var(--size-control);padding:12px 18px;border:var(--border-width) solid var(--color-border);border-radius:var(--radius-control);background:var(--color-surface);color:var(--color-text);font:inherit;cursor:pointer}
      .related-products-admin-actions .danger{color:var(--color-danger)}
      .related-products-form-actions{display:flex;gap:var(--space-element);flex-wrap:wrap;margin-top:var(--space-element)}
      .related-products-form-actions .primary{border-color:transparent;background:var(--color-primary);color:var(--color-primary-text)}
      .related-products-preview{display:block;max-width:260px;max-height:150px;object-fit:cover;border-radius:var(--radius-control)}
      .related-products-status{min-height:22px;color:var(--color-muted);font-size:14px}
      @media(max-width:520px){.related-products-admin-item{grid-template-columns:1fr;align-items:flex-start}.related-products-admin-meta{justify-content:flex-start;text-align:left}}
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