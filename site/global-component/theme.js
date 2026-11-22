/* Theme component: loads the stylesheet supplied by the page. */
class SiteTheme extends HTMLElement {
  connectedCallback() {
    const source = this.getAttribute("src");
    if (!source) return;

    let stylesheet = document.querySelector("link[data-site-theme]");
    if (!stylesheet) {
      stylesheet = document.createElement("link");
      stylesheet.rel = "stylesheet";
      stylesheet.dataset.siteTheme = "true";
      document.head.appendChild(stylesheet);
    }

    if (stylesheet.getAttribute("href") !== source) {
      stylesheet.setAttribute("href", source);
    }
  }
}

if (!customElements.get("site-theme")) {
  customElements.define("site-theme", SiteTheme);
}
