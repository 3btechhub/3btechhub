(() => {
  "use strict";

  if (document.getElementById("site-navigation")) return;

  const script = document.currentScript;
  if (!script) return;

  const rootUrl = new URL("../../", script.src);
  const root = document.createElement("div");
  root.id = "site-navigation";
  root.dataset.open = "false";

  const menu = document.createElement("nav");
  menu.className = "navigation-menu";
  menu.setAttribute("aria-label", "Main navigation");

  const list = document.createElement("ul");
  list.className = "navigation-list";

  const pages = [
    ["Home", "home/index.html", "home"],
    ["Account", "account/index.html", "account"],
    ["Dashboard", "dashboard/index.html", "dashboard"]
  ];

  const toggle = document.createElement("button");
  toggle.className = "navigation-toggle";
  toggle.type = "button";
  toggle.setAttribute("aria-label", "Open navigation menu");
  toggle.setAttribute("aria-expanded", "false");
  toggle.innerHTML = `
    <svg class="navigation-icon-open" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 6h16M4 12h16M4 18h16"></path>
    </svg>
    <svg class="navigation-icon-close" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M18 6 6 18M6 6l12 12"></path>
    </svg>
  `;

  function closeMenu() {
    root.dataset.open = "false";
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open navigation menu");
  }

  function openMenu() {
    root.dataset.open = "true";
    toggle.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-label", "Close navigation menu");
    updateModeLabel();
  }

  pages.forEach(([label, path, key]) => {
    const item = document.createElement("li");
    item.hidden = true;
    item.dataset.navigationKey = key;

    const link = document.createElement("a");
    link.href = new URL(path, rootUrl).href;
    link.textContent = label;

    if (new URL(link.href).pathname === location.pathname) {
      link.setAttribute("aria-current", "page");
    }

    link.addEventListener("click", closeMenu);
    item.appendChild(link);
    list.appendChild(item);
  });

  const modeItem = document.createElement("li");
  const modeButton = document.createElement("button");
  modeButton.type = "button";

  function updateModeLabel() {
    const theme = window.ThemeController;
    modeButton.textContent = theme?.getMode() === "dark" ? "Light Mode" : "Dark Mode";
  }

  modeButton.addEventListener("click", () => {
    const theme = window.ThemeController;
    if (!theme) return;

    theme.setMode(theme.getMode() === "dark" ? "light" : "dark");
    updateModeLabel();
  });

  modeItem.appendChild(modeButton);
  list.appendChild(modeItem);
  menu.appendChild(list);

  toggle.addEventListener("click", () => {
    root.dataset.open === "true" ? closeMenu() : openMenu();
  });

  document.addEventListener("pointerdown", event => {
    if (root.dataset.open === "true" && !root.contains(event.target)) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && root.dataset.open === "true") {
      closeMenu();
      toggle.focus();
    }
  });

  window.addEventListener("storage", event => {
    if (event.key === "3btechhub-color-mode") updateModeLabel();
  });

  updateModeLabel();
  root.append(menu, toggle);
  document.body.appendChild(root);

  async function updateNavigationVisibility() {
    try {
      const { canSeeTarget } = await import(new URL("../visibility/rbv.js", script.src).href);
      const { supabase } = await import(new URL("../system/supabase-client.js", script.src).href);

      const items = [...list.querySelectorAll("[data-navigation-key]")];
      await Promise.all(items.map(async item => {
        const key = item.dataset.navigationKey;
        let visible = await canSeeTarget("navigation", key);

        if (visible && key === "dashboard") {
          const { data: allowed, error } = await supabase.rpc(
            "can_access_page",
            { permission_slug: "page.dashboard.view" }
          );
          visible = !error && allowed === true;
        }

        item.hidden = !visible;
      }));
    } catch (error) {
      console.error("Supabase navigation RBV authorization failed.", error);
    }
  }

  updateNavigationVisibility();
})();
