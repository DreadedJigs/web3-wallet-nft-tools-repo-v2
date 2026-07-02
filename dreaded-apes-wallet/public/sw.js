const CACHE_NAME = 'dreaded-apes-wallet-v8';
const APP_SHELL = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './install/index.html',
  './install/install.css',
  './install/install.js',
  './guard/dreaded-guard.js',
  './guard/v1/dreaded-guard.js',
  './guard/index.html',
  './guard/demo.css',
  './guard/demo.js',
  './guard/policy.example.json',
  './manifest.webmanifest',
  './release.json',
  './icon.svg',
  './assets/core/dreaded-apes-app-icon-512.png',
  './assets/core/dreaded-apes-maskable-icon-512.png',
  './assets/core/dreaded-apes-og-card-1200x630.png',
  './assets/modern/dreaded-apes-modern-brand-kit.png',
  './assets/modern/dreaded-apes-ui-ux-design-guide.png',
  './assets/modern/dreaded-font-brand-guidelines.png',
  './assets/modern/dreaded-apes-palette.json',
  './assets/modern/dreaded-font-spec.md',
  './assets/wallet/extension-install-card-1200x800.png',
  './assets/wallet/guard-shield-panel-1200x800.png',
  './assets/wallet/media-vault-empty-state-1200x800.png',
  './assets/wallet/wallet-hero-bg-1600x900.png',
  './assets/covers/cover-antenna-choir.png',
  './assets/covers/cover-black-glass-radio.png',
  './assets/covers/cover-block-cuts-vol-9.png',
  './assets/covers/cover-cold-frame.png',
  './assets/covers/cover-mural-notes.png',
  './assets/covers/cover-red-sun-contact-sheet.png',
  './assets/covers/cover-static-midnight.png',
  './assets/covers/cover-vault-polaroids.png',
  './downloads/extension-install.txt'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;

  event.respondWith(
    fetch(request)
      .then(response => {
        const copy = response.clone();
        if (response.ok && new URL(request.url).origin === self.location.origin) {
          caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
        }
        return response;
      })
      .catch(() => caches.match(request).then(cached => cached || caches.match('./index.html')))
  );
});
