/* Theme component */
class SiteTheme extends HTMLElement {
  connectedCallback() {
    const themes = {
      classic: {
        background: "#ffffff",
        color: "#000000",
        fontSize: "large"
      }
    };

    const selectedTheme = (this.getAttribute("name") || "classic").toLowerCase();
    const theme = themes[selectedTheme] || themes.classic;
    const root = document.documentElement;

    root.style.setProperty("--page-background", theme.background);
    root.style.setProperty("--text-color", theme.color);
    root.style.setProperty("--font-size", theme.fontSize);
    root.setAttribute("data-theme", themes[selectedTheme] ? selectedTheme : "classic");
  }
}

if (!customElements.get("site-theme")) {
  customElements.define("site-theme", SiteTheme);
}
