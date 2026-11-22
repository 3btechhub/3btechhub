const root = document.documentElement;

function waitForFlag(flag, eventName) {
  if (root.dataset[flag] === 'true') return Promise.resolve();
  return new Promise(resolve => {
    document.addEventListener(eventName, () => {
      if (root.dataset[flag] === 'true') resolve();
    });
  });
}

function waitForWindowLoad() {
  if (document.readyState === 'complete') return Promise.resolve();
  return new Promise(resolve => window.addEventListener('load', resolve, { once: true }));
}

async function waitForCustomElements() {
  const names = new Set(
    Array.from(document.querySelectorAll('*'))
      .map(element => element.localName)
      .filter(name => name.includes('-'))
  );
  await Promise.all(Array.from(names, name => customElements.whenDefined(name)));
}

async function waitForImages() {
  const images = Array.from(document.images);
  await Promise.all(images.map(image => {
    if (image.complete && image.naturalWidth === 0) return Promise.resolve();
    if (typeof image.decode === 'function') return image.decode().catch(() => {});
    return new Promise(resolve => {
      if (image.complete) resolve();
      else {
        image.addEventListener('load', resolve, { once: true });
        image.addEventListener('error', resolve, { once: true });
      }
    });
  }));
}

async function revealPreparedPage() {
  await waitForWindowLoad();
  await Promise.all([
    document.fonts?.ready || Promise.resolve(),
    waitForCustomElements(),
    waitForFlag('navigationReady', 'site-navigation-ready')
  ]);

  const scripts = Array.from(document.scripts).map(script => script.src);
  if (scripts.some(src => src.includes('/component/account-auth.js'))) {
    await waitForFlag('pageAuthReady', 'page-auth-ready');
  }
  if (
    scripts.some(src => src.includes('/component/profile-auth.js')) ||
    scripts.some(src => src.includes('/component/dashboard-auth.js'))
  ) {
    await waitForFlag('privateAccessGranted', 'private-access-granted');
  }

  await waitForImages();
  await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  root.dataset.pageReady = 'true';
  document.dispatchEvent(new Event('page-ready'));
}

revealPreparedPage().catch(error => {
  console.error('Page preparation failed; the page remains hidden:', error);
});
