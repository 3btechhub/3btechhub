/* Self-contained floating site navigation. Pages only load this file. */
(() => {
  "use strict";

  const ROOT_ID = "site-navigation";
  const STYLE_ID = "site-navigation-styles";

  function initializeNavigation() {
    if (document.getElementById(ROOT_ID)) return;

    const script = document.currentScript ||
      document.querySelector('script[src$="/components/navigation.js"]');
    if (!script) return;

    const componentUrl = new URL(script.src, window.location.href);
    const siteRoot = new URL("../", componentUrl);

    const links = [
      { label: "Home", href: new URL("index.html", siteRoot).href },
      { label: "Account", href: new URL("account/index.html", siteRoot).href },
      { label: "Dashboard", href: new URL("dashboard/index.html", siteRoot).href }
    ];

    if (!document.getElementById(STYLE_ID)) {
      const style = document.createElement("style");
      style.id = STYLE_ID;
      style.textContent = `
        #${ROOT_ID} {
          position: fixed;
          left: 50%;
          bottom: 20px;
          z-index: 10000;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          transform: translateX(-50%);
          font: inherit;
        }

        #${ROOT_ID} .navigation-menu {
          display: none;
          min-width: 190px;
          padding: 8px;
          margin: 0;
          list-style: none;
          border-radius: 16px;
        }

        #${ROOT_ID}[data-open="true"] .navigation-menu {
          display: block;
        }

        #${ROOT_ID} .navigation-menu a,
        #${ROOT_ID} .navigation-menu button {
          box-sizing: border-box;
          display: block;
          width: 100%;
          padding: 12px 14px;
          border: 0;
          border-radius: 10px;
          background: transparent;
          text-align: left;
          text-decoration: none;
          font: inherit;
          cursor: pointer;
        }



        #${ROOT_ID} .navigation-toggle {
          width: 58px;
          height: 58px;
          padding: 0;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 1px solid var(--color-border);
          border-radius: 50%;
          cursor: pointer;
          -webkit-tap-highlight-color: transparent;
        }


        #${ROOT_ID} .navigation-toggle svg {
          display: block;
          width: 25px;
          height: 25px;
          fill: none;
          stroke-width: 2;
          stroke-linecap: round;
          stroke-linejoin: round;
        }
      `;
      document.head.appendChild(style);
    }

    const root = document.createElement("div");
    root.id = ROOT_ID;
    root.dataset.open = "false";

    const menu = document.createElement("nav");
    menu.className = "navigation-menu";
    menu.setAttribute("aria-label", "Main navigation");

    const list = document.createElement("ul");
    list.style.cssText = "list-style:none;padding:0;margin:0;";

    function closeMenu() {
      root.dataset.open = "false";
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open navigation menu");
      toggle.innerHTML = openIcon;
    }

    links.forEach(({ label, href }) => {
      const item = document.createElement("li");
      const link = document.createElement("a");
      link.href = href;
      link.textContent = label;
      if (new URL(href).pathname === window.location.pathname) {
        link.setAttribute("aria-current", "page");
      }
      link.addEventListener("click", closeMenu);
      item.appendChild(link);
      list.appendChild(item);
    });

    const modeItem = document.createElement("li");
    const modeButton = document.createElement("button");
    modeButton.type = "button";

    function updateModeButtonLabel() {
      const controller = window.ThemeController;
      if (!controller) {
        modeButton.textContent = "Switch Light / Dark Mode";
        return;
      }
      modeButton.textContent = controller.getEffectiveMode() === "dark"
        ? "Switch to Light Mode"
        : "Switch to Dark Mode";
    }

    modeButton.addEventListener("click", () => {
      const controller = window.ThemeController;
      if (!controller) return;

      const nextMode = controller.getEffectiveMode() === "dark" ? "light" : "dark";
      controller.setMode(nextMode);
      updateModeButtonLabel();
    });

    updateModeButtonLabel();
    modeItem.appendChild(modeButton);
    list.appendChild(modeItem);

    menu.appendChild(list);

    const toggle = document.createElement("button");
    toggle.className = "navigation-toggle";
    toggle.type = "button";
    toggle.setAttribute("aria-label", "Open navigation menu");
    toggle.setAttribute("aria-expanded", "false");

    const openIcon = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 6h16M4 12h16M4 18h16"></path></svg>';
    const closeIcon = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M18 6 6 18M6 6l12 12"></path></svg>';
    toggle.innerHTML = openIcon;

    function openMenu() {
      root.dataset.open = "true";
      toggle.setAttribute("aria-expanded", "true");
      toggle.setAttribute("aria-label", "Close navigation menu");
      toggle.innerHTML = closeIcon;
      updateModeButtonLabel();
    }

    toggle.addEventListener("click", () => {
      if (root.dataset.open === "true") closeMenu();
      else openMenu();
    });

    const systemColorScheme = window.matchMedia("(prefers-color-scheme: dark)");
    systemColorScheme.addEventListener("change", () => {
      const controller = window.ThemeController;
      if (controller && controller.getMode() === "system") {
        updateModeButtonLabel();
      }
    });

    window.addEventListener("storage", event => {
      if (event.key === "3btechhub-color-mode") updateModeButtonLabel();
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

    root.append(menu, toggle);
    document.body.appendChild(root);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeNavigation, { once: true });
  } else {
    initializeNavigation();
  }
})();
