// WeeklyChef service worker. Bump VERSION on each release to drop old caches.
const VERSION = 'v3';
const SHELL = `weeklychef-shell-${VERSION}`;
const ASSETS = `weeklychef-assets-${VERSION}`;
const SHELL_URLS = ['./', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png'];

// Precache the shell, plus the hashed JS/CSS that index.html references,
// so the app works offline right after the first visit.
async function precache() {
  const shell = await caches.open(SHELL);
  await shell.addAll(SHELL_URLS);
  const html = await (await fetch('./')).text();
  const urls = [...html.matchAll(/(?:src|href)="(\.?\/?assets\/[^"]+)"/g)].map((m) => m[1]);
  const assets = await caches.open(ASSETS);
  await assets.addAll(urls);
}

self.addEventListener('install', (e) => {
  e.waitUntil(precache().then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== SHELL && k !== ASSETS).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // Never intercept cross-origin traffic (Gemini, TheMealDB, ...): always live.
  if (url.origin !== location.origin) return;

  // Page loads: network first, fall back to the cached shell when offline.
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(SHELL).then((c) => c.put('./', copy));
          return res;
        })
        .catch(() => caches.match('./'))
    );
    return;
  }

  // Hashed build assets are immutable: cache first.
  if (url.pathname.includes('/assets/')) {
    e.respondWith(
      caches.match(req).then(
        (hit) =>
          hit ||
          fetch(req).then((res) => {
            const copy = res.clone();
            caches.open(ASSETS).then((c) => c.put(req, copy));
            return res;
          })
      )
    );
    return;
  }

  // Everything else (manifest, icons): serve cached, refresh in background.
  e.respondWith(
    caches.open(SHELL).then(async (cache) => {
      const hit = await cache.match(req);
      const refresh = fetch(req)
        .then((res) => {
          if (res.ok) cache.put(req, res.clone());
          return res;
        })
        .catch(() => hit);
      return hit || refresh;
    })
  );
});
