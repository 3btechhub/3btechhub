/* Theme component: loads the selected stylesheet and reveals the ready page. */
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

  async loadTheme() {
    const source = this.getAttribute("src");
    if (!source) {
      console.error("Theme stylesheet path is missing.");
      return;
    }

    const request = (this.loadRequest || 0) + 1;
    this.loadRequest = request;

    let stylesheet = document.querySelector("link[data-site-theme]");
    if (!stylesheet) {
      stylesheet = document.createElement("link");
      stylesheet.rel = "stylesheet";
      stylesheet.dataset.siteTheme = "true";
      document.head.appendChild(stylesheet);
    }

    try {
      if (stylesheet.getAttribute("href") !== source) {
        await new Promise((resolve, reject) => {
          stylesheet.addEventListener("load", resolve, { once: true });
          stylesheet.addEventListener("error", reject, { once: true });
          stylesheet.setAttribute("href", source);
        });
      } else if (!stylesheet.sheet) {
        await new Promise((resolve, reject) => {
          stylesheet.addEventListener("load", resolve, { once: true });
          stylesheet.addEventListener("error", reject, { once: true });
        });
      }

      await Promise.all([
        customElements.whenDefined("webpage-title"),
        customElements.whenDefined("site-navigation")
      ]);

      if (request === this.loadRequest) {
        document.documentElement.classList.add("page-ready");
      }
    } catch (error) {
      console.error("Unable to prepare the selected theme:", source, error);
    }
  }
}

if (!customElements.get("site-theme")) {
  customElements.define("site-theme", SiteTheme);
}
