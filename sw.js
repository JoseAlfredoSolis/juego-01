// Service worker for Super Bear Adventure (PWA).
// Network-first for HTML/JS so PC and mobile always pick up new builds.
const SW_VERSION = 'v88';
const CACHE = 'super-bear-v88';
const SHELL = [
  './',
  './index.html',
  './vendor/peer.min.js',
  './vendor/three.min.js',
  './manifest.webmanifest',
  './icon.svg'
];

function swIsFreshAsset(url) {
  return url.includes('/js/game.js') ||
    url.includes('/sw.js') ||
    url.endsWith('/index.html') ||
    url.endsWith('/') ||
    url.includes('index.html?');
}

function swNetworkFirst(request) {
  return fetch(request, { cache: 'no-store' }).then(resp => {
    if (resp && resp.status === 200) {
      const copy = resp.clone();
      caches.open(CACHE).then(cache => cache.put(request, copy));
    }
    return resp;
  }).catch(() => caches.match(request));
}

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', event => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = event.request.url;
  if (swIsFreshAsset(url)) {
    event.respondWith(swNetworkFirst(event.request));
    return;
  }
  event.respondWith(
    caches.match(event.request).then(cached => {
      const network = fetch(event.request).then(resp => {
        if (resp && resp.status === 200 && resp.type === 'basic') {
          const copy = resp.clone();
          caches.open(CACHE).then(cache => cache.put(event.request, copy));
        }
        return resp;
      }).catch(() => cached);
      return cached || network;
    })
  );
});
