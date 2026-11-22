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
    const componentScript = Array.from(document.scripts).find(script => script.src.includes('/component/navigation.js'));
    const siteRoot = componentScript ? new URL('../', componentScript.src) : new URL('/', window.location.href);
    const links = [
      { label: 'Home', path: './' },
      { label: 'Login', path: 'login/' },
      { label: 'Profile', path: 'profile/' },
      { label: 'Dashboard', path: 'dashboard/' }
    ];
    const currentPath = window.location.pathname.endsWith('/') ? window.location.pathname : window.location.pathname + '/';
    const visibleLinks = links.filter(item => {
      const target = new URL(item.path, siteRoot).pathname;
      return currentPath !== target;
    });
    const renderedNodes = [];
    const logoutSeparator = document.createElement('hr');
    logoutSeparator.className = 'effect-separator';
    logoutSeparator.hidden = true;
    logoutSeparator.setAttribute('aria-hidden', 'true');
    menu.appendChild(logoutSeparator);
    const renderLinks = dashboardAllowed => {
      renderedNodes.splice(0).forEach(node => node.remove());
      const allowedLinks = visibleLinks.filter(item => item.label !== 'Dashboard' || dashboardAllowed);
      allowedLinks.forEach((item, index) => {
        if (index > 0) {
          const separator = document.createElement('hr');
          separator.className = 'effect-separator';
          separator.setAttribute('aria-hidden', 'true');
          menu.insertBefore(separator, logoutSeparator);
          renderedNodes.push(separator);
        }
        const link = document.createElement('a');
        link.textContent = item.label;
        link.href = new URL(item.path, siteRoot).href;
        menu.insertBefore(link, logoutSeparator);
        renderedNodes.push(link);
      });
    };
    renderLinks(false);
    const logoutButton = document.createElement('button');
    logoutButton.className = 'navigation-logout';
    logoutButton.type = 'button';
    logoutButton.textContent = 'Logout';
    logoutButton.hidden = true;
    menu.appendChild(logoutButton);
    button.addEventListener('click', () => {
      const open = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', String(!open));
      button.setAttribute('aria-label', open ? 'Open navigation' : 'Close navigation');
      menu.hidden = open;
      path.setAttribute('d', open ? 'M3 6h18 M3 12h18 M3 18h18' : 'M5 5l14 14 M19 5L5 19');
    });
    logoutButton.addEventListener('click', async () => {
      try {
        const { supabase } = await import(new URL('./supabase-client.js', componentScript.src).href);
        const { error } = await supabase.auth.signOut({ scope: 'local' });
        if (error) throw error;
        window.location.replace(new URL('login/', siteRoot).href);
      } catch (error) { console.error('Logout failed:', error); }
    });
    this.replaceChildren(button, menu);
    if (!componentScript) return;
    import(new URL('./supabase-client.js', componentScript.src).href).then(async ({ supabase }) => {
      let check = 0;
      const update = async session => {
        const id = ++check;
        logoutButton.hidden = !session;
        logoutSeparator.hidden = !session;
        if (!session) { renderLinks(false); return; }
        try {
          const { data: userData, error: userError } = await supabase.auth.getUser();
          if (userError || !userData.user) throw userError || new Error('Authenticated user unavailable');
          const { data, error } = await supabase.from('user_roles').select('role').eq('user_id', userData.user.id).in('role', ['Owner', 'Admin']);
          if (error) throw error;
          if (id === check) renderLinks(Array.isArray(data) && data.length > 0);
        } catch (error) {
          if (id === check) renderLinks(false);
          console.error('Unable to verify Dashboard navigation access:', error);
        }
      };
      const { data, error } = await supabase.auth.getSession();
      if (error) { console.error('Unable to read account session:', error); renderLinks(false); }
      else await update(data.session);
      supabase.auth.onAuthStateChange((_event, session) => update(session));
    }).catch(error => { renderLinks(false); console.error('Unable to check account session:', error); });
  }
}
if (!customElements.get('site-navigation')) customElements.define('site-navigation', SiteNavigation);
