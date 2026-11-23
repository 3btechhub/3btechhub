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
      .our-services-section{width:min(100% - 32px,1120px);margin:clamp(28px,5vw,64px) auto;color:var(--color-text)}
      .our-services-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,245px),1fr));gap:18px}
      .our-service-card{display:flex;flex-direction:column;min-width:0;overflow:hidden;border:1px solid var(--color-border);border-radius:var(--radius-card,18px);background:var(--color-surface);color:var(--color-text);text-decoration:none;box-shadow:var(--shadow-card,0 8px 24px rgba(0,0,0,.08));transition:transform .18s ease,border-color .18s ease}
      .our-service-card:hover{transform:translateY(-3px);border-color:var(--color-primary)}
      .our-service-card:focus-visible{outline:3px solid var(--color-primary);outline-offset:3px}
      .our-service-card-media{position:relative;display:flex;align-items:center;justify-content:center;aspect-ratio:16/9;overflow:hidden;background:color-mix(in srgb,var(--color-primary) 9%,var(--color-surface));color:var(--color-primary)}
      .our-service-card-image{width:100%;height:100%;object-fit:cover}
      .our-service-card-icon{font-size:clamp(36px,5vw,54px);line-height:1}\n      .our-service-card-icon-overlay{position:absolute;top:12px;left:12px;display:grid;place-items:center;min-width:38px;min-height:38px;padding:6px;border:1px solid var(--color-border);border-radius:10px;background:color-mix(in srgb,var(--color-surface) 88%,transparent);font-size:22px}
      .our-service-card-body{display:grid;gap:8px;padding:18px}
      .our-service-card-title{margin:0;font-size:19px;line-height:1.3}
      .our-service-card-description{margin:0;color:var(--color-muted);font-size:14px;line-height:1.6;white-space:pre-line}
      .our-service-details{width:min(100% - 32px,900px);margin:clamp(28px,5vw,64px) auto;padding:clamp(18px,4vw,34px);border:1px solid var(--color-border);border-radius:var(--radius-card,18px);background:var(--color-surface);color:var(--color-text);box-shadow:var(--shadow-card,0 8px 24px rgba(0,0,0,.08))}
      .our-service-details-image{display:block;width:100%;max-height:440px;object-fit:cover;border-radius:12px;margin-bottom:24px}
      .our-service-details-icon{font-size:42px;margin-bottom:12px}
      .our-service-details-title{margin:0 0 12px;font-size:clamp(26px,4vw,38px)}
      .our-service-details-description{color:var(--color-muted);font-size:17px;line-height:1.7;white-space:pre-line}
      .our-service-details-content{line-height:1.8;white-space:pre-wrap;overflow-wrap:anywhere}
      .our-service-back{display:inline-flex;margin-top:24px;color:var(--color-primary);font-weight:600;text-decoration:none}
      .our-service-message{width:min(100% - 32px,900px);margin:32px auto;color:var(--color-muted);text-align:center}
      .our-services-admin{width:min(100%,900px);margin:24px auto;padding:var(--padding-card);border:1px solid var(--color-border);border-radius:var(--radius-card);background:var(--color-surface);color:var(--color-text);box-shadow:var(--shadow-card)}
      .our-services-admin [hidden]{display:none!important}
      .our-services-admin h2{margin:0 0 18px;font-size:20px}
      .our-services-field{display:grid;gap:8px;margin:14px 0}
      .our-services-field label,.our-services-field legend{font-size:14px;font-weight:600}
      .our-services-field input:not([type=file]):not([type=checkbox]),.our-services-field textarea,.our-services-field select{width:100%;min-height:var(--size-control);padding:11px 13px;border:1px solid var(--color-input-border);border-radius:var(--radius-control);background:var(--color-surface);color:var(--color-text);font:inherit}
      .our-services-field textarea{min-height:110px;resize:vertical}
      .our-services-role-list{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:8px}
      .our-services-role{display:flex;align-items:center;gap:8px;padding:9px;border:1px solid var(--color-border);border-radius:8px}
      .our-services-admin-list{display:grid;gap:10px;margin:20px 0}
      .our-services-admin-item{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px;border:1px solid var(--color-border);border-radius:10px}
      .our-services-admin-actions{display:flex;flex-wrap:wrap;gap:8px}
      .our-services-admin-actions button,.our-services-form-actions button{min-height:var(--size-control);padding:8px 14px;border:1px solid var(--color-border);border-radius:var(--radius-control);background:var(--color-surface);color:var(--color-text);font:inherit;cursor:pointer}
      .our-services-admin-actions .danger{color:var(--color-danger,#c33)}
      .our-services-form-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:18px}
      .our-services-form-actions .primary{background:var(--color-primary);color:white;border-color:var(--color-primary)}
      .our-services-preview{max-width:260px;max-height:150px;object-fit:cover;border-radius:8px}
      .our-services-status{min-height:22px;color:var(--color-muted);font-size:14px}
      @media(max-width:520px){.our-services-admin-item{align-items:flex-start;flex-direction:column}}
    `;
    document.head.appendChild(style);
  }

  module.renderCards = items => {
    ensureStyles();
    if (!items?.length) return null;
    const section = document.createElement("section");
    section.className = "our-services-section";
    section.setAttribute("aria-label", "Our Services");
    const grid = document.createElement("div");
    grid.className = "our-services-grid";
    items.forEach(item => {
      const card = document.createElement("a");
      card.className = "our-service-card";
      card.href = new URL("service/?slug=" + encodeURIComponent(item.slug), baseUrl()).href;
      const media = document.createElement("div");
      media.className = "our-service-card-media";
      if (item.image_path) {
        const image = document.createElement("img");
        image.className = "our-service-card-image";
        image.src = service.publicImageUrl(item.image_path);
        image.alt = item.name;
        image.loading = "lazy";
        image.decoding = "async";
        media.appendChild(image);
      } else {
        const icon = document.createElement("span");
        icon.className = "our-service-card-icon";
        icon.textContent = item.icon || "✦";
        icon.setAttribute("aria-hidden", "true");
        media.appendChild(icon);
      }
      const body = document.createElement("div");
      body.className = "our-service-card-body";
      const title = document.createElement("h2");
      title.className = "our-service-card-title";
      title.textContent = item.name;
      body.appendChild(title);
      if (item.description) {
        const description = document.createElement("p");
        description.className = "our-service-card-description";
        description.textContent = item.description;
        body.appendChild(description);
      }
      card.append(media, body);
      grid.appendChild(card);
    });
    section.appendChild(grid);
    return section;
  };

  module.renderDetails = item => {
    ensureStyles();
    const section = document.createElement("article");
    section.className = "our-service-details";
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
    if (item.description) {
      const description = document.createElement("p");
      description.className = "our-service-details-description";
      description.textContent = item.description;
      section.appendChild(description);
    }
    if (item.details) {
      const details = document.createElement("div");
      details.className = "our-service-details-content";
      details.textContent = item.details;
      section.appendChild(details);
    }
    const back = document.createElement("a");
    back.className = "our-service-back";
    back.href = new URL("./", baseUrl()).href;
    back.textContent = "← Back to Home";
    section.appendChild(back);
    return section;
  };
})();