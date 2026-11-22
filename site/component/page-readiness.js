const root = document.documentElement;

function withTimeout(promise, milliseconds, label) {
  let timeoutId;
  return Promise.race([
    Promise.resolve(promise),
    new Promise(resolve => {
      timeoutId = window.setTimeout(() => {
        console.warn(`Page preparation timed out: ${label}`);
        resolve();
      }, milliseconds);
    })
  ]).finally(() => window.clearTimeout(timeoutId));
}

function waitForFlag(flag, eventName, timeout = 12000) {
  if (root.dataset[flag] === 'true') return Promise.resolve();
  return withTimeout(new Promise(resolve => {
    const onReady = () => {
      if (root.dataset[flag] === 'true') {
        document.removeEventListener(eventName, onReady);
        resolve();
      }
    };
    document.addEventListener(eventName, onReady);
  }), timeout, flag);
}

function waitForWindowLoad() {
  if (document.readyState === 'complete') return Promise.resolve();
  return withTimeout(new Promise(resolve => {
    window.addEventListener('load', resolve, { once: true });
  }), 8000, 'window load');
}

async function waitForCustomElements() {
  const names = new Set(
    Array.from(document.querySelectorAll('*'))
      .map(element => element.localName)
      .filter(name => name.includes('-'))
  );
  await withTimeout(
    Promise.all(Array.from(names, name => customElements.whenDefined(name))),
    4000,
    'custom elements'
  );
}

function verifyStylesheets() {
  const failed = Array.from(document.querySelectorAll('link[rel~="stylesheet"]'))
    .filter(link => !link.sheet);
  if (failed.length) {
    console.warn('Some stylesheets did not load:', failed.map(link => link.href));
  }
}

async function waitForImages() {
  const images = Array.from(document.images);
  await withTimeout(Promise.all(images.map(async image => {
    image.loading = 'eager';
    if (!image.complete) {
      await new Promise(resolve => {
        image.addEventListener('load', resolve, { once: true });
        image.addEventListener('error', resolve, { once: true });
      });
    }
    if (image.naturalWidth > 0 && typeof image.decode === 'function') {
      await image.decode().catch(() => {});
    }
  })), 5000, 'images');
}

async function revealPreparedPage() {
  await waitForWindowLoad();
  verifyStylesheets();

  await Promise.all([
    withTimeout(document.fonts?.ready || Promise.resolve(), 4000, 'fonts'),
    waitForCustomElements(),
    waitForFlag('navigationReady', 'site-navigation-ready', 5000)
  ]);

  const scripts = Array.from(document.scripts).map(script => script.src);
  if (
    scripts.some(src => src.includes('/component/profile-auth.js')) ||
    scripts.some(src => src.includes('/component/dashboard-auth.js'))
  ) {
    await waitForFlag('privateAccessGranted', 'private-access-granted', 13000);
  }

  await waitForImages();
  await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
}

function revealPage() {
  if (root.dataset.pageReady === 'true') return;
  root.dataset.pageReady = 'true';
  document.dispatchEvent(new Event('page-ready'));
}

revealPreparedPage()
  .catch(error => console.error('Page preparation error:', error))
  .finally(revealPage);
