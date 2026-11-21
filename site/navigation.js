(()=> {
  document.documentElement.classList.add("site-preferences-pending");
  const script = document.currentScript;
  const base = new URL(".", script.src);
  const menu = document.createElement("nav");
  menu.className = "floating-navigation";
  menu.setAttribute("aria-label", "Main navigation");
  menu.innerHTML = `
    <ul class="floating-navigation__list" id="page-navigation">
      <li><a href="${new URL("home/", base).href}"><span class="floating-navigation__label">Home</span><span data-site-icon="nav.home"></span></a></li>
      <li><a href="${new URL("account/", base).href}"><span class="floating-navigation__label">Account</span><span data-site-icon="nav.account"></span></a></li>
      <li><a href="${new URL("dashboard/", base).href}"><span class="floating-navigation__label">Dashboard</span><span data-site-icon="nav.dashboard"></span></a></li>
      <li class="floating-navigation__separator" aria-hidden="true"></li>
      <li><button class="floating-navigation__theme" type="button" aria-label="Switch to dark mode">
        <span class="floating-navigation__theme-label">Dark mode</span>
        <span class="floating-navigation__theme-icon" data-site-icon="theme.dark"></span>
      </button></li>
    </ul>
    <button class="floating-navigation__toggle" type="button" aria-label="Open navigation menu" aria-expanded="false" aria-controls="page-navigation">
      <span class="floating-navigation__toggle-icon" data-site-icon="nav.menu"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 6h16M4 12h16M4 18h16"/></svg></span>
    </button>`;
  document.body.appendChild(menu);
  const toggle = menu.querySelector(".floating-navigation__toggle");
  const icon = toggle.querySelector("[data-site-icon]");
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
    themeIcon.dataset.siteIcon = theme === "dark" ? "theme.light" : "theme.dark";
    window.siteIcons?.apply();  };
  const storedTheme = getStoredTheme();
  if (storedTheme === "light" || storedTheme === "dark") applyTheme(storedTheme);
  else {
    const systemDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialTheme = systemDark ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", initialTheme);
    themeLabel.textContent = initialTheme === "dark" ? "Light mode" : "Dark mode";
    themeButton.setAttribute("aria-label", "Switch to " + (initialTheme === "dark" ? "light" : "dark") + " mode");
    themeIcon.dataset.siteIcon = initialTheme === "dark" ? "theme.light" : "theme.dark";  }
  const open = () => {
    menu.classList.add("is-open");
    toggle.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-label", "Close navigation menu");
    icon.dataset.siteIcon = "nav.close";
    window.siteIcons?.apply();
  };
  const close = () => {
    menu.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open navigation menu");
    icon.dataset.siteIcon = "nav.menu";
    window.siteIcons?.apply();
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
Promise.all([import("https://esm.sh/@supabase/supabase-js@2.119.1"),import("./icons.js"),import("./preferences.js")]).then(([{createClient},{initSiteIcons},{initSitePreferences}])=>{const client=createClient("https://sburxeuxkrilbfppxylm.supabase.co","sb_publishable_lqGGahZ0ST267jqsI3Zelg_477szacT");window.siteIcons=initSiteIcons(client);initSitePreferences(client)}).catch(error=>{console.warn("Global site settings unavailable:",error);document.documentElement.setAttribute("dir","ltr");document.documentElement.classList.remove("site-preferences-pending");});
