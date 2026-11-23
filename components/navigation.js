(() => {
  "use strict";

  const scriptUrl = document.currentScript?.src || new URL("navigation.js", window.location.href).href;
  const basePath = new URL("../", scriptUrl).pathname;
  const functionUrl = "https://sburxeuxkrilbfppxylm.supabase.co/functions/v1/protected-page";
  const publishableKey = "sb_publishable_lqGGahZ0ST267jqsI3Zelg_477szacT";

  const nav = document.createElement("nav");
  nav.id = "site-navigation";
  nav.setAttribute("aria-label", "Main navigation");
  nav.innerHTML = `
    <ul class="nav-menu" id="site-nav-menu">
      <li id="site-nav-links"><a href="${basePath}">Home</a></li>
      <li><button id="theme-mode-toggle" class="menu-theme-toggle ui-button" type="button">Dark mode</button></li>
    </ul>
    <button class="nav-toggle ui-button ui-button-primary" type="button" aria-label="Open menu"
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
  const currentPath = () => {
    const path = window.location.pathname;
    return path.endsWith("/") ? path : path + "/";
  };
  const isCurrentPage = item => {
    const path = currentPath();
    const target = item.path ? basePath + item.path : basePath;
    return path === target || (item.path !== "" && path.startsWith(target));
  };
  const renderLinks = items => {
    links.replaceChildren();
    items.filter(item => !isCurrentPage(item)).forEach(item => {
      const link = document.createElement("a");
      link.className = "ui-nav-menu-link";
      link.href = basePath + item.path;
      link.textContent = item.label;
      links.appendChild(link);
    });
  };

  const toggleButton = nav.querySelector(".nav-toggle");
  const closeMenu = () => {
    nav.classList.remove("is-open");
    toggleButton.setAttribute("aria-expanded", "false");
    toggleButton.setAttribute("aria-label", "Open menu");
  };
  toggleButton.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    toggleButton.setAttribute("aria-expanded", String(isOpen));
    toggleButton.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
  });
  document.addEventListener("pointerdown", event => {
    if (nav.classList.contains("is-open") && !nav.contains(event.target)) {
      closeMenu();
    }
  });

  const mountNavigation = () => {
    if (!document.body || nav.isConnected) return;
    document.body.appendChild(nav);
    document.dispatchEvent(new Event("3b-navigation-ready"));
  };

  if (document.body) {
    mountNavigation();
  } else {
    document.addEventListener("DOMContentLoaded", mountNavigation, { once: true });
  }

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