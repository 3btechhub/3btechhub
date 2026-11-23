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
      .our-services-section{width:min(100% - (2 * var(--page-padding)),1120px);margin:var(--space-section) auto;color:var(--color-text)}
      .our-services-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,245px),1fr));gap:var(--space-element)}
      .our-service-tile{--ui-tile-padding:16px}
      .our-services-grid{grid-template-columns:repeat(auto-fit,minmax(min(100%,280px),1fr))}
      .our-service-tile .ui-tile-media{flex:0 0 56px}
      .our-service-details{width:min(100% - (2 * var(--page-padding)),900px);margin:var(--space-section) auto}
      .our-service-details-image{display:block;width:100%;max-height:440px;object-fit:cover;border-radius:var(--radius-card);margin-bottom:var(--space-element)}
      .our-service-details-icon{font-size:var(--icon-size);margin-bottom:var(--space-element)}
      .our-service-details-title{margin:0 0 var(--space-element);font-size:clamp(26px,4vw,38px)}
      .our-service-back{display:inline-flex;margin-top:var(--space-element);color:var(--color-primary);font-weight:600;text-decoration:none}
      .our-service-message{width:min(100% - (2 * var(--page-padding)),900px);margin:var(--space-section) auto;color:var(--color-muted);text-align:center}
      .our-services-admin{width:min(100% - (2 * var(--page-padding)),900px);margin:var(--space-section) auto}
      .our-services-admin [hidden]{display:none!important}
      .our-services-admin h2{margin:0 0 var(--space-element);font-size:1.25rem}
      .our-services-field{display:grid;gap:8px;margin:var(--space-element) 0}
      .our-services-field label,.our-services-field legend{font-size:14px;font-weight:600}
      .our-services-field input:not([type=file]):not([type=checkbox]),.our-services-field textarea,.our-services-field select{width:100%;min-height:var(--size-control);padding:12px 14px;border:var(--border-width) solid var(--color-input-border);border-radius:var(--radius-control);background:var(--color-surface);color:var(--color-text);font:inherit}
      .our-services-field textarea{min-height:calc(var(--size-control) * 2);resize:vertical}
      .our-services-role-list{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:var(--space-element)}
      .our-services-role{display:flex;align-items:center;gap:8px;padding:10px;border:var(--border-width) solid var(--color-border);border-radius:var(--radius-control)}
      .our-services-admin-list{display:grid;gap:10px;margin:var(--space-element) 0}
      .our-services-admin-item{display:grid;grid-template-columns:minmax(0,1fr) minmax(180px,auto);align-items:center;justify-content:space-between;gap:var(--space-element);width:100%;padding:14px 16px;border:var(--border-width) solid var(--color-border);border-radius:var(--radius-control);background:var(--color-surface);color:var(--color-text);font:inherit;text-align:left;cursor:pointer}
      .our-services-admin-item.is-selected{border-color:var(--color-primary);outline:1px solid var(--color-primary)}
      .our-services-admin-identity{min-width:0}
      .our-services-admin-slug{color:var(--color-muted);font-size:13px;overflow-wrap:anywhere}
      .our-services-admin-meta{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:var(--space-element);color:var(--color-muted);font-size:13px;text-align:right}
      .our-services-admin-item:focus-visible{outline:2px solid var(--color-primary);outline-offset:2px}
      .our-services-admin-actions{display:flex;flex-wrap:wrap;gap:var(--space-element)}
      .our-services-admin-actions button,.our-services-form-actions button{min-height:var(--size-control);padding:12px 18px;border:var(--border-width) solid var(--color-border);border-radius:var(--radius-control);background:var(--color-surface);color:var(--color-text);font:inherit;cursor:pointer}
      .our-services-admin-actions .danger{color:var(--color-danger)}
      .our-services-form-actions{display:flex;gap:var(--space-element);flex-wrap:wrap;margin-top:var(--space-element)}
      .our-services-form-actions .primary{border-color:transparent;background:var(--color-primary);color:var(--color-primary-text)}
      .our-services-preview{display:block;max-width:260px;max-height:150px;object-fit:cover;border-radius:var(--radius-control)}
      .our-services-status{min-height:22px;color:var(--color-muted);font-size:14px}
      @media(max-width:520px){.our-services-admin-item{grid-template-columns:1fr;align-items:flex-start}.our-services-admin-meta{justify-content:flex-start;text-align:left}}
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
      const card = document.createElement("a");
      card.className = "our-service-tile ui-tile";
      card.href = new URL("service/?slug=" + encodeURIComponent(item.slug), baseUrl()).href;
      const media = document.createElement("div");
      media.className = "ui-tile-media";
      if (item.image_path) {
        const image = document.createElement("img");
        image.className = "";
        image.src = service.publicImageUrl(item.image_path);
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