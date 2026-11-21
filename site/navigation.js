(()=> {
  const script = document.currentScript;
  const base = new URL(".", script.src);
  const menu = document.createElement("nav");
  menu.className = "floating-navigation";
  menu.setAttribute("aria-label", "Main navigation");
  menu.innerHTML = `
    <ul class="floating-navigation__list" id="page-navigation">
      <li><a href="${new URL("home/", base).href}">Home</a></li>
      <li><a href="${new URL("account/", base).href}">Account</a></li>
      <li><a href="${new URL("dashboard/", base).href}">Dashboard</a></li>
      <li class="floating-navigation__separator" aria-hidden="true"></li>
      <li><button class="floating-navigation__theme" type="button" aria-label="Switch to dark mode">
        <span class="floating-navigation__theme-label">Dark mode</span>
        <svg class="floating-navigation__theme-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 15.5A8.5 8.5 0 0 1 8.5 3.5 8.5 8.5 0 1 0 20.5 15.5Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button></li>
    </ul>
    <button class="floating-navigation__toggle" type="button" aria-label="Open navigation menu" aria-expanded="false" aria-controls="page-navigation">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
    </button>`;
  document.body.appendChild(menu);
  const toggle = menu.querySelector(".floating-navigation__toggle");
  const icon = toggle.querySelector("svg");
  const themeButton = menu.querySelector(".floating-navigation__theme");
  const themeLabel = menu.querySelector(".floating-navigation__theme-label");
  const themeIcon = menu.querySelector(".floating-navigation__theme-icon");
  const getStoredTheme = () => {
    try { return localStorage.getItem("3btechhub-theme"); } catch (_) { return null; }
  };
  const applyTheme = theme => {
    document.documentElement.setAttribute("data-theme", theme);
    try { localStorage.setItem("3btechhub-theme", theme); } catch (_) {}
    const nextTheme = theme === "dark" ? "light" : "dark";
    themeLabel.textContent = nextTheme === "dark" ? "Dark mode" : "Light mode";
    themeButton.setAttribute("aria-label", "Switch to " + nextTheme + " mode");
    themeIcon.innerHTML = theme === "dark"
      ? '<circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>'
      : '<path d="M20.5 15.5A8.5 8.5 0 0 1 8.5 3.5 8.5 8.5 0 1 0 20.5 15.5Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>';
  };
  const storedTheme = getStoredTheme();
  if (storedTheme === "light" || storedTheme === "dark") applyTheme(storedTheme);
  else {
    const systemDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialTheme = systemDark ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", initialTheme);
    themeLabel.textContent = initialTheme === "dark" ? "Light mode" : "Dark mode";
    themeButton.setAttribute("aria-label", "Switch to " + (initialTheme === "dark" ? "light" : "dark") + " mode");
    if (initialTheme === "dark") themeIcon.innerHTML = '<circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>';
  }
  const open = () => {
    menu.classList.add("is-open");
    toggle.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-label", "Close navigation menu");
    icon.innerHTML = '<path d="M6 6l12 12M18 6L6 18"/>';
  };
  const close = () => {
    menu.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open navigation menu");
    icon.innerHTML = '<path d="M4 6h16M4 12h16M4 18h16"/>';
  };
  toggle.addEventListener("click", () => menu.classList.contains("is-open") ? close() : open());
  themeButton.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme") || "light";
    applyTheme(current === "dark" ? "light" : "dark");
  });
  document.addEventListener("click", event => { if (!menu.contains(event.target)) close(); });
  document.addEventListener("keydown", event => { if (event.key === "Escape") close(); });
  menu.querySelectorAll("a").forEach(link => link.addEventListener("click", close));
})();