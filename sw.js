const CACHE_NAME = 'salafinit-v1';
const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './assets/icons/icon.svg',
  './shared/css/reset.css',
  './shared/css/tokens.css',
  './shared/css/layout.css',
  './shared/css/base-button.css',
  './shared/css/base-card.css',
  './shared/css/base-state.css',
  './shared/css/utilities.css',
  './shared/css/quick-jump.css',
  './hadiths/css/hadith-books.css',
  './hadiths/css/hadith-chapters.css',
  './hadiths/css/hadith-dashboard.css',
  './hadiths/css/hadith-detail.css',
  './hadiths/css/hadith-grading.css',
  './hadiths/css/hadith-search.css',
  './quran/css/quran-content.css',
  './quran/css/quran-list.css',
  './quran/css/quran-modal.css',
  './quran/css/quran-settings.css',
  './salah/css/salah-extra.css',
  './salah/css/salah-grid.css',
  './salah/css/salah-main.css',
  './learn/css/learn.css',
  './learn/css/bible-index.css',
  './learn/css/bible-reader.css',
  './learn/css/other.css',
  './learn/css/salafiyyah.css',
  './learn/css/judaism.css',
  './learn/css/hinduism.css',
  './shared/theme.js',
  './utils/app.js',
  './shared/router.js',
  './shared/api/store.js',
  './utils/utils.js',
  './shared/api/client.js',
  './shared/components/share.js',
  './shared/components/quick-jump.js',
  './utils/bookmark/css.css',
  './utils/bookmark/db.js',
  './utils/bookmark/fzf.js',
  './utils/bookmark/picker.js',
  './utils/bookmark/index.js',
  './utils/quran-progress/css.css',
  './utils/quran-progress/surahs.js',
  './utils/quran-progress/index.js',
  './quran/api.js',
  './quran/config.js',
  './quran/tafsir.js',
  './salah/api.js',
  './hadiths/api.js',
  './hadiths/books.js',
  './hadiths/sunni/fetcher.js',
  './hadiths/sunni/index.js',
  './hadiths/sunni/translation.js',
  './quran/components/index.js',
  './quran/components/config.js',
  './quran/components/router.js',
  './quran/components/utils.js',
  './quran/components/settings.js',
  './quran/components/surah-list.js',
  './quran/components/surah-content.js',
  './quran/components/tafsir.js',
  './hadiths/components/hadith-dashboard.js',
  './hadiths/components/hadith-view.js',
  './salah/components/salah-view.js',
  './learn/books/bible.js',
  './learn/books/judaism.js',
  './learn/books/hinduism.js',
  './learn/components/bible-view.js',
  './learn/components/judaism-view.js',
  './learn/components/hinduism-view.js',
  './learn/components/other-view.js',
  './learn/components/salafiyyah-view.js',
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
