const CACHE_NAME = 'salafinit-v1';
const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './assets/icons/icon.svg',
  './.const/reset.css',
  './.const/tokens.css',
  './.const/layout.css',
  './.const/components/css/base-badge.css',
  './.const/components/css/base-button.css',
  './.const/components/css/base-card.css',
  './.const/components/css/base-state.css',
  './.const/components/css/utilities.css',
  './hadiths/.const/components/css/hadith-books.css',
  './hadiths/.const/components/css/hadith-chapters.css',
  './hadiths/.const/components/css/hadith-dashboard.css',
  './hadiths/.const/components/css/hadith-detail.css',
  './hadiths/.const/components/css/hadith-grading.css',
  './hadiths/.const/components/css/hadith-search.css',
  './quran/.const/components/css/quran-content.css',
  './quran/.const/components/css/quran-list.css',
  './quran/.const/components/css/quran-modal.css',
  './quran/.const/components/css/quran-settings.css',
  './salah/.const/components/css/salah-extra.css',
  './salah/.const/components/css/salah-grid.css',
  './salah/.const/components/css/salah-main.css',
  './utils/app.js',
  './.const/router.js',
  './.const/api/store.js',
  './utils/utils.js',
  './.const/api/client.js',
  './quran/.const/api.js',
  './quran/.const/config.js',
  './quran/.const/tafsir.js',
  './salah/.const/api.js',
  './hadiths/.const/api.js',
  './hadiths/.const/books.js',
  './hadiths/sunni/fetcher.js',
  './hadiths/sunni/index.js',
  './hadiths/sunni/translation.js',
  './quran/.const/components/js/index.js',
  './quran/.const/components/js/config.js',
  './quran/.const/components/js/router.js',
  './quran/.const/components/js/utils.js',
  './quran/.const/components/js/settings.js',
  './quran/.const/components/js/surah-list.js',
  './quran/.const/components/js/surah-content.js',
  './quran/.const/components/js/tafsir.js',
  './hadiths/.const/components/js/hadith-view.js',
  './salah/.const/components/js/salah-view.js',
  './learn/index.js'
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
