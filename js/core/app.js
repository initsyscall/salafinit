const App = (() => {
  function init() {
    initHamburger();
    registerRoutes();
    Router.init();
    registerServiceWorker();
  }

  function initHamburger() {
    const hamburger = document.getElementById('header-hamburger');
    const nav = document.getElementById('header-nav');
    if (!hamburger || !nav) return;

    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      nav.classList.toggle('open');
    });

    document.querySelectorAll('.header__nav-link').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        nav.classList.remove('open');
      });
    });
  }

  function registerRoutes() {
    Router.on('/', () => {
      const main = document.getElementById('app-main');
      main.innerHTML = '';

      const hero = Utils.createElement('div', { className: 'home-hero' }, [
        Utils.createElement('p', { className: 'home-hero__bismillah' }, 'بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ'),
        Utils.createElement('h1', { className: 'home-hero__title', innerHTML: 'salaf<span class="hero__dot">.</span><span class="hero__init">Init</span><span class="hero__parens">();</span>' }),
        Utils.createElement('p', { className: 'home-hero__subtitle', style: 'max-width: 600px; line-height: 1.8;' }, 'Pray, "My Lord! Increase me in knowledge." - Surah taha 114')
      ]);
      main.appendChild(hero);

      const grid = Utils.createElement('div', { className: 'grid grid--responsive home-grid' }, [
        createFeatureCard('ٱلْقُرْآن', 'The Noble Quran - Uthmani Text with Translation and Tafsir', 'quran', '#quran'),
        createFeatureCard('ٱلْحَدِيثُ', 'Hadith Collections - Kutub al-Sittah + More', 'hadith', '#hadiths'),
        createFeatureCard('ٱلصَّلَاةُ', 'Salah Timings - Prayer times based on your location', 'salah', '#salah'),
        createFeatureCard('ٱلْعِلْمُ', 'Study Resources - Coming Soon', 'learn', '#learn'),
        createFeatureCard('ٱلْمُحَجَّبُ', 'Bookmark - Save your favorites (Coming Soon)', 'bookmark', '#bookmark')
      ]);
      main.appendChild(grid);
    });

    Router.on('quran', () => QuranView.render(document.getElementById('app-main')));
    Router.on('quran/:surah', (container, params) => QuranView.render(container, params));
    Router.on('quran/tafsir/:surah/:ayah', (container, params) => QuranView.render(container, { tafsir: true, surah: params.surah, ayah: params.ayah }));
    Router.on('quran/:surah/:ayah', (container, params) => QuranView.render(container, params));
    Router.on('quran/image/:surah/:ayah', (container, params) => QuranView.render(container, { image: true, surah: params.surah, ayah: params.ayah }));

    Router.on('hadiths', () => HadithView.render(document.getElementById('app-main')));
    Router.on('hadiths/:collection/:book/:hadith', (container, params) => HadithView.render(container, params));
    Router.on('hadiths/:collection/:book', (container, params) => HadithView.render(container, params));

    Router.on('salah', () => SalahView.render(document.getElementById('app-main')));

    Router.on('learn', () => {
      const main = document.getElementById('app-main');
      main.innerHTML = `
        <div class="empty-state" style="min-height: 60vh; display: flex; flex-direction: column; align-items: center; justify-content: center;">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#A855F7" stroke-width="1.5" style="margin-bottom: var(--spacing-lg); opacity: 0.8;">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
          </svg>
          <h2 class="empty-state__title" style="color: var(--color-text);">Coming Soon</h2>
          <p class="empty-state__description" style="max-width: 400px; text-align: center;">
            Learn feature is under development. Access study resources, courses, and Islamic materials.
          </p>
        </div>
      `;
    });

    Router.on('bookmark', () => {
      const main = document.getElementById('app-main');
      main.innerHTML = `
        <div class="empty-state" style="min-height: 60vh; display: flex; flex-direction: column; align-items: center; justify-content: center;">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#F472C6" stroke-width="1.5" style="margin-bottom: var(--spacing-lg); opacity: 0.8;">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
          </svg>
          <h2 class="empty-state__title" style="color: var(--color-text);">Coming Soon</h2>
          <p class="empty-state__description" style="max-width: 400px; text-align: center;">
            Bookmark feature is under development. Save your favorite hadiths, verses, and notes for later.
          </p>
        </div>
      `;
    });

    Router.notFound((container) => {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state__title">Page Not Found</div>
          <div class="empty-state__description">The page you are looking for does not exist.</div>
          <a href="#/" class="btn btn--primary" style="margin-top: var(--spacing-xl);">Go Home</a>
        </div>
      `;
    });
  }

  function createFeatureCard(arabicTitle, description, type, href) {
    const card = Utils.createElement('a', {
      className: `card feature-card feature-card--${type}`,
      href: href,
      style: 'cursor: pointer;'
    }, [
      Utils.createElement('div', { className: `feature-card__arabic feature-card__arabic--${type}` }, arabicTitle),
      Utils.createElement('p', { className: 'feature-card__description' }, description)
    ]);
    return card;
  }

  function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
          .catch(() => { });
      });
    }
  }

  return { init };
})();

document.addEventListener('DOMContentLoaded', () => App.init());
