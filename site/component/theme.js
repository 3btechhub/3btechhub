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

  async waitForComponent(selector, elementName) {
    await customElements.whenDefined(elementName);

    const component = document.querySelector(selector);
    if (!component) {
      throw new Error(`Required component is missing: ${selector}`);
    }

    if (component.dataset.componentReady === "true") return;

    await new Promise(resolve => {
      component.addEventListener("component-ready", resolve, { once: true });
    });
  }

  async waitForPageAuth(page) {
    if (page?.dataset.authCheckRequired !== "true") return;
    if (document.documentElement.dataset.pageAuthReady === "true") return;

    await new Promise(resolve => {
      document.addEventListener("page-auth-ready", resolve, { once: true });
    });
  }

  async waitForPrivateAccess(page) {
    if (page?.dataset.authRequired !== "true") return;
    if (document.documentElement.dataset.privateAccess === "granted") return;

    await new Promise(resolve => {
      document.addEventListener("private-access-granted", resolve, { once: true });
    });
  }

  async loadTheme() {
    const source = this.getAttribute("src");
    if (!source) {
      console.error("Theme stylesheet path is missing.");
      return;
    }

    const request = (this.loadRequest || 0) + 1;
    this.loadRequest = request;

    const page = document.getElementById("page-content");
    const skeleton = document.querySelector(".skeleton-screen");

    document.documentElement.classList.remove("page-ready");
    if (page) page.hidden = true;
    if (skeleton) skeleton.hidden = false;

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
        this.waitForComponent("webpage-title", "webpage-title"),
        this.waitForComponent("site-navigation", "site-navigation")
      ]);

      await this.waitForPageAuth(page);
      await this.waitForPrivateAccess(page);

      if (request !== this.loadRequest) return;

      await new Promise(resolve => {
        requestAnimationFrame(() => requestAnimationFrame(resolve));
      });

      if (request === this.loadRequest) {
        if (page) page.hidden = false;
        if (skeleton) skeleton.hidden = true;
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