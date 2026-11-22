/* Theme component: loads the stylesheet selected by the page context. */
class SiteTheme extends HTMLElement {
  static get observedAttributes() {
    return ["src"];
  }

  connectedCallback() {
    this.loadTheme();
  }

  attributeChangedCallback() {
    if (this.isConnected) this.loadTheme();
  }

  loadTheme() {
    const source = this.getAttribute("src");
    if (!source) {
      console.error("Theme stylesheet path is missing.");
      return;
    }

    let stylesheet = document.querySelector("link[data-site-theme]");
    if (!stylesheet) {
      stylesheet = document.createElement("link");
      stylesheet.rel = "stylesheet";
      stylesheet.dataset.siteTheme = "true";
      stylesheet.addEventListener("error", () => {
        console.error("Unable to load the selected theme stylesheet:", stylesheet.href);
      });
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
