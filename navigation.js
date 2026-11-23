(() => {
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
      gap: 12px;
      font-family: var(--font-family);
    }
    #site-navigation .nav-menu {
      display: none;
      min-width: 180px;
      margin: 0;
      padding: 10px;
      list-style: none;
      background: var(--color-surface);
      color: var(--color-text);
      border: 1px solid var(--color-border);
      border-radius: 14px;
      box-shadow: var(--shadow-card);
    }
    #site-navigation.is-open .nav-menu { display: block; }
    #site-navigation .nav-menu a,
    #site-navigation .menu-theme-toggle {
      display: block;
      width: 100%;
      padding: 12px 16px;
      color: var(--color-text);
      text-align: left;
      text-decoration: none;
      border: 0;
      border-radius: 8px;
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
      width: 58px;
      height: 58px;
      display: grid;
      place-items: center;
      border: 1px solid var(--color-border);
      border-radius: 50%;
      background: var(--color-primary);
      color: var(--color-primary-text);
      box-shadow: var(--shadow-card);
      cursor: pointer;
    }
    #site-navigation .nav-toggle svg { width: 25px; height: 25px; }
    #site-navigation .icon-close { display: none; }
    #site-navigation.is-open .icon-menu { display: none; }
    #site-navigation.is-open .icon-close { display: block; }
  `;
  document.head.appendChild(style);

  const basePath = new URL(".", document.currentScript.src).pathname;
  const nav = document.createElement("nav");
  nav.id = "site-navigation";
  nav.setAttribute("aria-label", "Main navigation");
  nav.innerHTML = `
    <ul class="nav-menu" id="site-nav-menu">
      <li><a href="${basePath}">Home</a></li>
      <li><a href="${basePath}account/">Account</a></li>
      <li><a href="${basePath}dashboard/">Dashboard</a></li>
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

  const button = nav.querySelector(".nav-toggle");
  button.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    button.setAttribute("aria-expanded", String(isOpen));
    button.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
  });

  document.body.appendChild(nav);
  document.dispatchEvent(new Event("3b-navigation-ready"));
})();
