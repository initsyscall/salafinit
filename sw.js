const CACHE_NAME = 'salafinit-v1';
const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './css/reset.css',
  './css/tokens.css',
  './css/layout.css',
  './css/components.css',
  './js/core/app.js',
  './js/core/router.js',
  './js/core/store.js',
  './js/core/utils.js',
  './js/api/client.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  const path = url.pathname;

  if (path.startsWith('/css/') ||
      path.startsWith('/js/') ||
      path.startsWith('/assets/') ||
      path === '/' ||
      path === '/index.html' ||
      path.endsWith('/salafInit/') ||
      path.endsWith('/salafInit/index.html')) {
    event.respondWith(cacheFirst(event.request));
    return;
  }

  event.respondWith(networkFirst(event.request));
});

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, response.clone());
    return response;
  } catch {
    return caches.match('./index.html');
  }
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    return new Response('Offline', { status: 503 });
  }
}
