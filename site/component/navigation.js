/* Navigation component */
class SiteNavigation extends HTMLElement {
  connectedCallback() {
    if (this.dataset.initialized === 'true') return;
    this.dataset.initialized = 'true';

    const button = document.createElement('button');
    button.className = 'navigation-toggle';
    button.type = 'button';
    button.setAttribute('aria-label', 'Open navigation');
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-controls', 'site-navigation-menu');

    const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    icon.setAttribute('viewBox', '0 0 24 24');
    icon.setAttribute('aria-hidden', 'true');

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M3 6h18 M3 12h18 M3 18h18');
    icon.appendChild(path);
    button.appendChild(icon);

    const menu = document.createElement('nav');
    menu.className = 'navigation-menu';
    menu.id = 'site-navigation-menu';
    menu.setAttribute('aria-label', 'Main navigation');
    menu.hidden = true;

    const componentScript = Array.from(document.scripts).find(script =>
      script.src.includes('/component/navigation.js')
    );
    const siteRoot = componentScript
      ? new URL('../', componentScript.src)
      : new URL('/', window.location.href);

    [
      ['Home', 'home/'],
      ['Account', 'account/'],
      ['Dashboard', 'dashboard/']
    ].forEach(([label, path], index) => {
      if (index > 0) {
        const separator = document.createElement('span');
        separator.className = 'effect-separator-vertical';
        separator.setAttribute('aria-hidden', 'true');
        menu.appendChild(separator);
      }

      const link = document.createElement('a');
      link.textContent = label;
      link.href = new URL(path, siteRoot).href;
      menu.appendChild(link);
    });

    button.addEventListener('click', () => {
      const isOpen = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', String(!isOpen));
      button.setAttribute('aria-label', isOpen ? 'Open navigation' : 'Close navigation');
      menu.hidden = isOpen;
      path.setAttribute('d', isOpen
        ? 'M3 6h18 M3 12h18 M3 18h18'
        : 'M5 5l14 14 M19 5L5 19');
    });

    this.replaceChildren(button, menu);
    this.dataset.componentReady = 'true';
    this.dispatchEvent(new Event('component-ready'));
  }
}

if (!customElements.get('site-navigation')) {
  customElements.define('site-navigation', SiteNavigation);
}