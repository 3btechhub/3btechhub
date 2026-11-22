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

  async loadSkeletonShadow(skeleton) {
    const componentScript = Array.from(document.scripts).find(script =>
      script.src.includes("/component/theme.js")
    );
    if (!componentScript || !skeleton) return;

    const siteRoot = new URL("../", componentScript.src);
    let pagePath = window.location.pathname;

    if (pagePath.startsWith(siteRoot.pathname)) {
      pagePath = pagePath.slice(siteRoot.pathname.length);
    }

    pagePath = "/" + pagePath.replace(/^\/+/, "");
    if (pagePath !== "/" && !pagePath.endsWith("/")) pagePath += "/";

    const cacheKey = `3btechhub:skeleton:${pagePath}`;
    let cachedHtml = null;

    try {
      cachedHtml = localStorage.getItem(cacheKey);
    } catch (error) {
      console.warn("Local Skeleton cache is unavailable:", error);
    }

    const renderPageShadow = sourcePage => {
      if (!sourcePage) return;

      const shadowPage = sourcePage.cloneNode(true);
      shadowPage.removeAttribute("id");
      shadowPage.removeAttribute("hidden");
      shadowPage.setAttribute("aria-hidden", "true");
      shadowPage.inert = true;

      shadowPage.querySelectorAll("script, style, site-navigation, site-theme")
        .forEach(element => element.remove());

      const sourceTitle = shadowPage.querySelector("webpage-title");
      if (sourceTitle) {
        const title = document.createElement("h1");
        title.className = "webpage-title skeleton-text";
        title.setAttribute("aria-hidden", "true");
        title.style.width = "min(42%, 240px)";
        sourceTitle.replaceWith(title);
      }

      shadowPage.querySelectorAll("input, button, textarea, select").forEach(element => {
        element.disabled = true;
        element.removeAttribute("id");
        element.removeAttribute("name");
        element.removeAttribute("for");
        element.removeAttribute("placeholder");
        element.setAttribute("aria-hidden", "true");
        if ("value" in element) element.value = "";
      });

      shadowPage.querySelectorAll("*").forEach(element => {
        element.removeAttribute("id");
        element.removeAttribute("for");
        element.removeAttribute("href");
        element.removeAttribute("tabindex");

        Array.from(element.attributes).forEach(attribute => {
          if (attribute.name.startsWith("on")) {
            element.removeAttribute(attribute.name);
          }
        });
      });

      const walker = document.createTreeWalker(shadowPage, NodeFilter.SHOW_TEXT);
      const textNodes = [];
      while (walker.nextNode()) textNodes.push(walker.currentNode);

      for (const textNode of textNodes) {
        const text = textNode.nodeValue.trim();
        if (!text) continue;

        const placeholder = document.createElement("span");
        placeholder.className = "skeleton-text";
        placeholder.setAttribute("aria-hidden", "true");
        placeholder.style.width = `${Math.min(18, Math.max(2, text.length * 0.48))}em`;
        textNode.replaceWith(placeholder);
      }

      const wrapper = document.createElement("div");
      wrapper.className = "skeleton-shadow";
      wrapper.appendChild(shadowPage);

      skeleton.replaceChildren(wrapper);
      skeleton.classList.add("skeleton-structure");
    };

    const renderSnapshot = html => {
      const sourceDocument = new DOMParser().parseFromString(html, "text/html");
      renderPageShadow(sourceDocument.querySelector("#page-content"));
    };

    // The live page DOM is the primary source. Keep it stable during loading;
    // cached snapshots are only a fallback when no live page markup exists.
    const livePage = document.querySelector("#page-content");
    renderPageShadow(livePage);

    if (!livePage && cachedHtml) renderSnapshot(cachedHtml);

    const { supabase } = await import(
      new URL("./supabase-client.js", componentScript.src).href
    );

    const { data, error } = await supabase
      .from("site_skeleton_cache")
      .select("source_html")
      .eq("page_path", pagePath)
      .maybeSingle();

    if (error) throw error;
    if (!data?.source_html) return;

    try {
      localStorage.setItem(cacheKey, data.source_html);
    } catch (storageError) {
      console.warn("Unable to refresh local Skeleton cache:", storageError);
    }

    if (!livePage && data.source_html !== cachedHtml) {
      renderSnapshot(data.source_html);
    }
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

    this.loadSkeletonShadow(skeleton).catch(error => {
      console.error("Unable to load the cached page structure for Skeleton UI:", error);
    });

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
        document.dispatchEvent(new Event("page-ready"));
      }
    } catch (error) {
      console.error("Unable to prepare the selected theme:", source, error);
    }
  }
}

if (!customElements.get("site-theme")) {
  customElements.define("site-theme", SiteTheme);
}
