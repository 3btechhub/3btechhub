(() => {
  "use strict";
  window.__3bComponents = window.__3bComponents || {};
  const baseUrl = () => window.__3bBaseUrl || new URL("../../", location.href);
  const view = {
    renderCards(items, config) {
      if (!items?.length) return null;
      const section = document.createElement("section");
      section.className = "ui-large-card ui-size-large ui-section";
      section.setAttribute("aria-label", config.plural);
      const grid = document.createElement("div");
      grid.className = "ui-item-grid";
      items.forEach(item => {
        const card = document.createElement("a");
        card.className = "ui-card ui-size-medium";
        card.href = new URL(config.routeSegment + "/?slug=" + encodeURIComponent(item.slug), baseUrl()).href;
        const content = document.createElement("div");
        content.className = "ui-card-content";
        const title = document.createElement("h2");
        title.className = "ui-card-title";
        title.textContent = item.name || "";
        content.appendChild(title);
        const media = document.createElement("div");
        media.className = "ui-card-media";
        if (item.image_path) {
          const image = document.createElement("img");
          image.src = config.api.publicImageUrl(item.image_path);
          image.alt = "";
          image.loading = "lazy";
          media.appendChild(image);
        } else if (item.icon) {
          const glyph = document.createElement("span");
          glyph.textContent = item.icon;
          glyph.setAttribute("aria-hidden", "true");
          media.appendChild(glyph);
        } else {
          const glyph = document.createElement("span");
          glyph.className = "ui-card-svg-icon";
          const iconUrl = new URL("assets/icons/" + item.slug + ".svg", baseUrl()).href;
          glyph.style.webkitMaskImage = 'url("' + iconUrl + '")';
          glyph.style.maskImage = 'url("' + iconUrl + '")';
          media.appendChild(glyph);
        }
        card.append(content, media);
        grid.appendChild(card);
      });
      section.appendChild(grid);
      return section;
    },
    renderDetails(item, config) {
      const section = document.createElement("article");
      section.className = "ui-large-card ui-size-large ui-detail-card ui-content-details";
      if (item.image_path) {
        const image = document.createElement("img");
        image.className = "ui-content-details-image";
        image.src = config.api.publicImageUrl(item.image_path);
        image.alt = item.name;
        section.appendChild(image);
      } else if (item.icon) {
        const icon = document.createElement("div");
        icon.className = "ui-content-details-icon";
        icon.textContent = item.icon;
        icon.setAttribute("aria-hidden", "true");
        section.appendChild(icon);
      }
      const title = document.createElement("h1");
      title.className = "ui-content-details-title";
      title.textContent = item.name;
      section.appendChild(title);
      const back = document.createElement("a");
      back.className = "ui-content-details-back";
      back.href = new URL("./", baseUrl()).href;
      back.textContent = "← Back to Home";
      section.appendChild(back);
      return section;
    },
    async mountHome(root, config) {
      const marker = config.key + "HomeMounted";
      if (!root || root.dataset[marker] === "true") return;
      root.dataset[marker] = "true";
      try {
        const items = await config.api.listPublic();
        const cards = this.renderCards(items, config);
        if (cards) root.appendChild(cards);
      } catch (error) {
        console.error("[3B TECH HUB] " + config.plural + " could not be loaded:", error);
      }
    },
    async mountDetails(root, config) {
      const marker = config.key + "DetailsMounted";
      if (!root || root.dataset[marker] === "true") return;
      root.dataset[marker] = "true";
      try {
        const slug = new URLSearchParams(location.search).get("slug");
        if (!slug) throw new Error(config.singular + " not found.");
        const item = await config.api.getPublicBySlug(slug);
        if (!item) throw new Error(config.singular + " not found or unavailable.");
        root.appendChild(this.renderDetails(item, config));
        document.title = item.name + " | 3B TECH HUB";
      } catch (error) {
        const message = document.createElement("p");
        message.className = "ui-content-message";
        message.textContent = error.message || ("Unable to load this " + config.singular.toLowerCase() + ".");
        root.appendChild(message);
      }
    }
  };
  window.__3bComponents.contentModuleView = view;
})();
