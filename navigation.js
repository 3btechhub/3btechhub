(() => {
  "use strict";

  const scriptUrl = document.currentScript?.src || new URL("navigation.js", window.location.href).href;
  const basePath = new URL(".", scriptUrl).pathname;
  const functionUrl = "https://sburxeuxkrilbfppxylm.supabase.co/functions/v1/protected-page";
  const publishableKey = "sb_publishable_lqGGahZ0ST267jqsI3Zelg_477szacT";

  const style = document.createElement("style");
  style.textContent = `
    #site-navigation {
      position: fixed;
      left: 50%;
      bottom: max(20px, env(safe-area-inset-bottom));
      transform: translateX(-50%);
      z-index: 1000;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-element);
      font-family: var(--font-family);
    }
    #site-navigation .nav-menu {
      display: none;
      width: 180px;
      margin: 0;
      padding: var(--space-sm);
      list-style: none;
      background: var(--color-surface);
      color: var(--color-text);
      border: var(--border-width) solid var(--color-border);
      border-radius: var(--radius-card);
      box-shadow: var(--shadow-card);
    }
    #site-navigation.is-open .nav-menu { display: block; }
    #site-navigation .nav-menu a,
    #site-navigation .menu-theme-toggle {
      display: block;
      width: 100%;
      padding: var(--space-sm) var(--space-md);
      color: var(--color-text);
      text-align: left;
      text-decoration: none;
      border: 0;
      border-radius: var(--radius-control);
      background: transparent;
      font: inherit;
      cursor: pointer;
    }
    #site-navigation .nav-menu a:hover,
    #site-navigation .nav-menu a:focus-visible,
    #site-navigation .menu-theme-toggle:hover,
    #site-navigation .menu-theme-toggle:focus-visible {
      background: var(--color-hover);
      outline: none;
    }
    #site-navigation .nav-toggle {
      width: calc(var(--size-control) + var(--space-md));
      height: calc(var(--size-control) + var(--space-md));
      display: grid;
      place-items: center;
      border: 1px solid var(--color-border);
      border-radius: 50%;
      background: var(--color-primary);
      color: var(--color-primary-text);
      box-shadow: var(--shadow-card);
      cursor: pointer;
    }
    #site-navigation .nav-toggle svg { width: var(--icon-size); height: var(--icon-size); }
    #site-navigation .icon-close { display: none; }
    #site-navigation.is-open .icon-menu { display: none; }
    #site-navigation.is-open .icon-close { display: block; }
  `;
  document.head.appendChild(style);

  const nav = document.createElement("nav");
  nav.id = "site-navigation";
  nav.setAttribute("aria-label", "Main navigation");
  nav.innerHTML = `
    <ul class="nav-menu" id="site-nav-menu">
      <li id="site-nav-links"><a href="${basePath}">Home</a></li>
      <li><button id="theme-mode-toggle" class="menu-theme-toggle" type="button">Dark mode</button></li>
    </ul>
    <button class="nav-toggle" type="button" aria-label="Open menu"
      aria-expanded="false" aria-controls="site-nav-menu">
      <svg class="icon-menu" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        stroke-width="2" stroke-linecap="round" aria-hidden="true">
        <path d="M4 6h16M4 12h16M4 18h16"></path>
      </svg>
      <svg class="icon-close" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        stroke-width="2" stroke-linecap="round" aria-hidden="true">
        <path d="m6 6 12 12M18 6 6 18"></path>
      </svg>
    </button>
  `;

  const links = nav.querySelector("#site-nav-links");
  const renderLinks = items => {
    links.innerHTML = items.map(item =>
      `<a href="${basePath}${item.path}">${item.label}</a>`
    ).join("");
  };

  const toggleButton = nav.querySelector(".nav-toggle");
  toggleButton.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    toggleButton.setAttribute("aria-expanded", String(isOpen));
    toggleButton.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
  });

  document.body.appendChild(nav);
  document.dispatchEvent(new Event("3b-navigation-ready"));

  let refreshId = 0;
  const refreshVisibility = async () => {
    const currentRefresh = ++refreshId;
    const supabase = window.supabaseClient;
    if (!supabase) return;

    try {
      const { data, error } = await supabase.auth.getSession();
      if (currentRefresh !== refreshId) return;
      if (error || !data.session) {
        window.__3bAccess?.setPermissions([]);
        renderLinks([
          { path: "", label: "Home" },
          { path: "login/", label: "Login" }
        ]);
        return;
      }

      const response = await fetch(functionUrl + "?page=visibility", {
        method: "GET",
        headers: {
          apikey: publishableKey,
          Authorization: "Bearer " + data.session.access_token
        },
        cache: "no-store"
      });
      if (currentRefresh !== refreshId) return;
      if (!response.ok) {
        window.__3bAccess?.setPermissions([]);
        renderLinks([{ path: "", label: "Home" }]);
        return;
      }

      const result = await response.json();
      const permissions = Array.isArray(result.permissions) ? result.permissions : [];
      window.__3bAccess?.setPermissions(permissions);

      const items = [{ path: "", label: "Home" }];
      if (permissions.includes("page.account.view")) {
        items.push({ path: "account/", label: "Account" });
      }
      if (permissions.includes("page.dashboard.view")) {
        items.push({ path: "dashboard/", label: "Dashboard" });
      }
      renderLinks(items);
    } catch (error) {
      console.error("[3B TECH HUB] Role visibility could not be loaded:", error);
      window.__3bAccess?.setPermissions([]);
      renderLinks([{ path: "", label: "Home" }]);
    }
  };

  const initializeAccess = () => {
    if (!window.supabaseClient) return;
    refreshVisibility();
    window.supabaseClient.auth.onAuthStateChange(() => {
      refreshVisibility();
    });
  };

  if (window.supabaseClient) {
    initializeAccess();
  } else {
    document.addEventListener("3b-auth-client-ready", initializeAccess, { once: true });
  }
})();
