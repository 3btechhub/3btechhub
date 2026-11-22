export function initSiteIcons(supabase) {
  if (window.__3bSiteIcons) {
    window.__3bSiteIcons.refresh();
    return window.__3bSiteIcons;
  }

  const cache = new Map();
  let refreshPromise = null;
  const allowedTags = new Set(["svg", "g", "path", "circle", "rect", "line", "polyline", "polygon", "ellipse"]);
  const allowedAttrs = new Set(["viewBox", "xmlns", "fill", "stroke", "stroke-width", "stroke-linecap", "stroke-linejoin", "d", "cx", "cy", "r", "x", "y", "width", "height", "points", "rx", "ry", "fill-rule", "clip-rule", "transform"]);

  const exactRules = [
    [/^(home|homepage)$/, "nav.home"],
    [/^(account|profile|user)$/, "nav.account"],
    [/^(dashboard|overview)$/, "nav.dashboard"],
    [/^(services?|service type|repair|repairs|maintenance|installation|setup)$/, "module.services"],
    [/^(products?|product type|sales|buy|sell)$/, "module.products"],
    [/^(technicians?|mechanics?|mechanicians?)$/, "module.technician"],
    [/^(workshops?)$/, "module.workshop"],
    [/^(gallery)$/, "module.gallery"],
    [/^(contacts?|contact information|phone|mobile)$/, "module.contacts"],
    [/^(images?|photos?|picture|pictures|image)$/, "module.images"],
    [/^(videos?|video)$/, "module.videos"],
    [/^(settings?|customization|home page section management)$/, "dashboard.settings"],
    [/^(administration|users?|roles?|permissions?|permission|user|role)$/, "dashboard.administration"],
    [/^(relations?|relationships?|relation form|target section)$/, "dashboard.content"],
    [/^(region|location|address|country|countries)$/, "field.location"],
    [/^(language|languages?)$/, "field.name"],
    [/^(theme|dark mode)$/, "theme.dark"],
    [/^(light mode)$/, "theme.light"],
    [/^(email|e-mail)$/, "field.email"],
    [/^(password)$/, "field.password"],
    [/^(name|title)$/, "field.name"],
    [/^(visibility|visible|status)$/, "field.visibility"],
    [/^(upload)$/, "action.upload"],
    [/^(create|add|new|create form)$/, "action.create"],
    [/^(edit|update)$/, "action.edit"],
    [/^(delete|remove)$/, "action.delete"],
    [/^(save|submit|save relations)$/, "action.save"],
    [/^(cancel|close|hide)$/, "action.cancel"],
    [/^(logout|sign out)$/, "action.logout"],
    [/^(search|view all|see all|existed list)$/, "action.search"],
    [/^(login|sign in)$/, "layout.login"],
    [/^(svg icons|media)$/, "media.photo"]
  ];

  const semanticRules = [
    [/\b(home|homepage)\b/, "nav.home"],
    [/\b(account|profile)\b/, "nav.account"],
    [/\b(dashboard|overview)\b/, "nav.dashboard"],
    [/\b(service|repair|maintenance|installation)\b/, "module.services"],
    [/\b(product|sales)\b/, "module.products"],
    [/\b(technician|mechanic)\b/, "module.technician"],
    [/\b(workshop)\b/, "module.workshop"],
    [/\b(gallery)\b/, "module.gallery"],
    [/\b(contact|phone|whatsapp)\b/, "module.contacts"],
    [/\b(video)\b/, "module.videos"],
    [/\b(image|photo|picture)\b/, "module.images"],
    [/\b(region|location|address|country|map)\b/, "field.location"],
    [/\b(email)\b/, "field.email"],
    [/\b(password)\b/, "field.password"],
    [/\b(name|title)\b/, "field.name"],
    [/\b(visibility|visible|status)\b/, "field.visibility"],
    [/\b(create|add|new)\b/, "action.create"],
    [/\b(edit|update)\b/, "action.edit"],
    [/\b(delete|remove)\b/, "action.delete"],
    [/\b(save|submit)\b/, "action.save"],
    [/\b(cancel|close|hide)\b/, "action.cancel"],
    [/\b(search|view all|see all|existed list)\b/, "action.search"],
    [/\b(setting|customization)\b/, "dashboard.settings"],
    [/\b(administration|users|roles|permissions)\b/, "dashboard.administration"],
    [/\b(relation|relationship)\b/, "dashboard.content"],
    [/\b(language)\b/, "field.name"],
    [/\b(theme|dark mode)\b/, "theme.dark"]
  ];

  const namedSelector = "h1,h2,h3,h4,h5,h6,button,a,label,[role='button'],.dashboard__item-name,.content__field > strong,.home__image-caption,.home__type-link,.content__title,.content__item,.content__back,.content__home,.content__external,.home__view-all-card,.home__map-link";

  function readName(target) {
    return [...target.childNodes]
      .filter(node => node.nodeType === Node.TEXT_NODE)
      .map(node => node.nodeValue || "")
      .join(" ")
      .replace(/\s+/g, " ")
      .trim() || (target.innerText || target.textContent || "").replace(/\s+/g, " ").trim();
  }

  function iconKey(target, rawName) {
    const name = String(rawName || "").replace(/\s+/g, " ").replace(/[：:]+$/, "").trim().toLowerCase();
    if (!name) return null;

    const exact = exactRules.find(([pattern]) => pattern.test(name));
    if (exact) return exact[1];

    if (target.matches(".content__item")) {
      const type = new URL(target.href, location.href).searchParams.get("type");
      const typeRule = exactRules.find(([pattern, key]) => key.startsWith("module.") && pattern.test(String(type || "").toLowerCase()));
      if (typeRule) return typeRule[1];
    }

    return semanticRules.find(([pattern]) => pattern.test(name))?.[1] || null;
  }

  function decorate(scope = document) {
    const candidates = [];
    if (scope.matches?.(namedSelector)) candidates.push(scope);
    scope.querySelectorAll?.(namedSelector).forEach(node => candidates.push(node));

    candidates.forEach(target => {
      if (target.closest("[data-site-icon]") || target.querySelector("[data-site-icon],svg,img,input,select,textarea")) return;
      if (target.querySelector(namedSelector)) return;

      const name = readName(target);
      if (!name || name.length > 80 || name.split(/\s+/).length > 9) return;

      const key = iconKey(target, name);
      if (!key || !cache.has(key) || target.querySelector(":scope > [data-site-icon]")) return;

      const icon = document.createElement("span");
      icon.dataset.siteIcon = key;
      icon.setAttribute("aria-hidden", "true");
      icon.className = "site-icon site-icon--automatic";
      target.append(icon);
    });
  }

  function cleanSvg(source) {
    const doc = new DOMParser().parseFromString(String(source || ""), "image/svg+xml");
    const root = doc.documentElement;
    if (root.tagName.toLowerCase() !== "svg" || doc.querySelector("parsererror")) return null;

    const clean = node => {
      [...node.attributes].forEach(attr => {
        if (!allowedAttrs.has(attr.name)) node.removeAttribute(attr.name);
      });
      [...node.children].forEach(child => {
        if (!allowedTags.has(child.tagName.toLowerCase())) child.remove();
        else clean(child);
      });
    };

    clean(root);
    root.setAttribute("aria-hidden", "true");
    root.setAttribute("focusable", "false");
    return document.importNode(root, true);
  }

  function apply(scope = document) {
    decorate(scope);
    const targets = [];
    if (scope.matches?.("[data-site-icon]")) targets.push(scope);
    scope.querySelectorAll?.("[data-site-icon]").forEach(node => targets.push(node));

    targets.forEach(target => {
      const code = cache.get((target.dataset.siteIcon || "").trim());
      if (!code) return;
      const svg = cleanSvg(code);
      if (!svg) return;
      target.replaceChildren(svg);
      target.classList.add("site-icon");
    });
  }

  async function refresh() {
    if (refreshPromise) return refreshPromise;
    refreshPromise = (async () => {
      const { data, error } = await supabase
        .from("site_svg_icons")
        .select("icon_key,svg_code")
        .eq("is_active", true);

      if (error) {
        console.warn("SVG icon library unavailable:", error.message);
        return false;
      }

      cache.clear();
      (data || []).forEach(item => cache.set(item.icon_key, item.svg_code));
      apply(document);
      window.dispatchEvent(new CustomEvent("3b:icons-updated"));
      return true;
    })().finally(() => {
      refreshPromise = null;
    });
    return refreshPromise;
  }

  const observer = new MutationObserver(records => {
    records.forEach(record => {
      if (record.type === "characterData" && record.target.parentElement) apply(record.target.parentElement);
      record.addedNodes.forEach(node => {
        if (node.nodeType === Node.ELEMENT_NODE) apply(node);
        else if (node.nodeType === Node.TEXT_NODE && node.parentElement) apply(node.parentElement);
      });
    });
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    characterData: true
  });

  window.addEventListener("3b:global-update", refresh);
  const controller = { refresh, apply };
  window.__3bSiteIcons = controller;
  window.siteIcons = controller;
  refresh();
  return controller;
}
