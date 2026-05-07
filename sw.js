const CACHE_NAME = 'salafinit-v1';
const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './assets/icons/icon.svg',
  './css/reset.css',
  './css/tokens.css',
  './css/layout.css',
  './css/components/index.css',
  './css/components/base-badge.css',
  './css/components/base-button.css',
  './css/components/base-card.css',
  './css/components/base-state.css',
  './css/components/hadith-books.css',
  './css/components/hadith-chapters.css',
  './css/components/hadith-dashboard.css',
  './css/components/hadith-detail.css',
  './css/components/hadith-grading.css',
  './css/components/hadith-search.css',
  './css/components/quran-content.css',
  './css/components/quran-list.css',
  './css/components/quran-modal.css',
  './css/components/quran-settings.css',
  './css/components/salah-extra.css',
  './css/components/salah-grid.css',
  './css/components/salah-main.css',
  './css/components/utilities.css',
  './js/core/app.js',
  './js/core/router.js',
  './js/core/store.js',
  './js/core/utils.js',
  './js/api/client.js',
  './js/api/quran.js',
  './js/api/quran/config.js',
  './js/api/tafsir-api.js',
  './js/api/salah.js',
  './js/api/hadiths/config.js',
  './js/api/hadiths/books.js',
  './js/api/hadiths/fetcher.js',
  './js/api/hadiths/index.js',
  './js/views/quran/index.js',
  './js/views/quran/config.js',
  './js/views/quran/router.js',
  './js/views/quran/utils.js',
  './js/views/quran/settings.js',
  './js/views/quran/surah-list.js',
  './js/views/quran/surah-content.js',
  './js/views/quran/tafsir.js',
  './js/views/hadith/hadith-view.js',
  './js/views/salah/salah-view.js',
  './js/views/learn/learn-view.js'
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
    caches.keys().then((keys) => {
      const currentCache = CACHE_NAME;
      return Promise.all(
        keys.filter((k) => k !== currentCache && k.startsWith('salafinit-'))
          .map((k) => caches.delete(k))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  // Always fetch navigation requests fresh from network to prevent stale HTML
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request));
    return;
  }

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
