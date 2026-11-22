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

    const addSeparator = (parent = menu) => {
      const separator = document.createElement('hr');
      separator.className = 'effect-separator';
      separator.setAttribute('aria-hidden', 'true');
      parent.appendChild(separator);
    };

    const addLink = (label, path, parent = menu) => {
      const link = document.createElement('a');
      link.textContent = label;
      link.href = new URL(path, siteRoot).href;
      parent.appendChild(link);
      return link;
    };

    const addPageGroup = (label, path, children) => {
      const group = document.createElement('div');
      group.className = 'navigation-page-group';
      addLink(label, path, group);

      const submenu = document.createElement('div');
      submenu.className = 'navigation-submenu';
      submenu.setAttribute('aria-label', label + ' pages');

      children.forEach((child, index) => {
        if (index > 0) addSeparator(submenu);
        addLink(child.label, child.path, submenu);
      });

      group.appendChild(submenu);
      menu.appendChild(group);
    };

    addPageGroup('Home', 'home/', [
      { label: 'Overview', path: 'home/overview/' }
    ]);
    addSeparator();

    addPageGroup('Account', 'account/', [
      { label: 'Login', path: 'account/login/' },
      { label: 'Profile', path: 'account/profile/' }
    ]);
    addSeparator();

    addPageGroup('Dashboard', 'dashboard/', [
      { label: 'Overview', path: 'dashboard/overview/' }
    ]);

    const logoutSeparator = document.createElement('hr');
    logoutSeparator.className = 'effect-separator';
    logoutSeparator.hidden = true;
    logoutSeparator.setAttribute('aria-hidden', 'true');
    menu.appendChild(logoutSeparator);

    const logoutButton = document.createElement('button');
    logoutButton.className = 'navigation-logout';
    logoutButton.type = 'button';
    logoutButton.textContent = 'Logout';
    logoutButton.hidden = true;
    menu.appendChild(logoutButton);

    button.addEventListener('click', () => {
      const isOpen = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', String(!isOpen));
      button.setAttribute('aria-label', isOpen ? 'Open navigation' : 'Close navigation');
      menu.hidden = isOpen;
      path.setAttribute('d', isOpen
        ? 'M3 6h18 M3 12h18 M3 18h18'
        : 'M5 5l14 14 M19 5L5 19');
    });

    logoutButton.addEventListener('click', async () => {
      logoutButton.disabled = true;
      try {
        const { supabase } = await import(new URL('./supabase-client.js', componentScript.src).href);
        const { error } = await supabase.auth.signOut({ scope: 'local' });
        if (error) throw error;
        window.location.replace(new URL('account/login/', siteRoot).href);
      } catch (error) {
        console.error('Logout failed:', error);
        logoutButton.disabled = false;
      }
    });

    this.replaceChildren(button, menu);
    this.dataset.componentReady = 'true';
    this.dispatchEvent(new Event('component-ready'));

    if (componentScript) {
      import(new URL('./supabase-client.js', componentScript.src).href)
        .then(({ supabase }) => {
          const updateLogout = session => {
            logoutButton.hidden = !session;
            logoutSeparator.hidden = !session;
            if (session) logoutButton.disabled = false;
          };

          supabase.auth.getSession().then(({ data }) => updateLogout(data.session));
          supabase.auth.onAuthStateChange((_event, session) => updateLogout(session));
        })
        .catch(error => console.error('Unable to check account session:', error));
    }
  }
}

if (!customElements.get('site-navigation')) {
  customElements.define('site-navigation', SiteNavigation);
}
