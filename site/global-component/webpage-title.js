/* Webpage Title component */
class WebpageTitle extends HTMLElement {
  connectedCallback() {
    const title = document.createElement('h1');
    title.textContent = this.textContent.trim();
    title.className = 'webpage-title';
    this.replaceChildren(title);
    this.dataset.componentReady = 'true';
    this.dispatchEvent(new Event('component-ready'));
  }
}

if (!customElements.get('webpage-title')) {
  customElements.define('webpage-title', WebpageTitle);
}