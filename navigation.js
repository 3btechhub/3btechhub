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
      font-family: system-ui, sans-serif;
    }
    #site-navigation .nav-menu {
      display: none;
      min-width: 180px;
      margin: 0;
      padding: 10px;
      list-style: none;
      background: #111827;
      border: 1px solid #374151;
      border-radius: 14px;
      box-shadow: 0 10px 30px rgb(0 0 0 / 25%);
    }
    #site-navigation.is-open .nav-menu { display: block; }
    #site-navigation .nav-menu a {
      display: block;
      padding: 12px 16px;
      color: #f9fafb;
      text-decoration: none;
      border-radius: 8px;
    }
    #site-navigation .nav-menu a:hover,
    #site-navigation .nav-menu a:focus-visible {
      background: #374151;
      outline: none;
    }
    #site-navigation .nav-toggle {
      width: 58px;
      height: 58px;
      display: grid;
      place-items: center;
      border: 1px solid #4b5563;
      border-radius: 50%;
      background: #111827;
      color: #fff;
      box-shadow: 0 6px 22px rgb(0 0 0 / 30%);
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
})();
