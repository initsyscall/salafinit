const App = (() => {
  function init() {
    lockPortrait();
    initHamburger();
    registerRoutes();
    Router.init();
    registerServiceWorker();
  }

  function initHamburger() {
    const toggle = document.getElementById('nav-toggle');
    const slider = document.getElementById('nav-slider');
    if (!toggle || !slider) return;

    toggle.addEventListener('click', () => {
      slider.classList.toggle('open');
      toggle.classList.toggle('open');
    });

    document.querySelectorAll('.header__nav-link, .theme-toggle').forEach(el => {
      el.addEventListener('click', () => {
        slider.classList.remove('open');
        toggle.classList.remove('open');
      });
    });
  }

  function lockPortrait() {
    if (!screen.orientation?.lock) return;
    screen.orientation.lock('portrait').catch(() => {});
    const unlock = () => { try { screen.orientation?.unlock?.(); } catch(e) {} };
    document.addEventListener('click', unlock, { once: true });
    document.addEventListener('touchstart', unlock, { once: true });
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
        createFeatureCard('ٱلْعِلْمُ', 'Learn Salafiyyah, shia & other religion', 'learn', '#learn'),
        createFeatureCard('ٱلْأَدَوَاتُ', 'Utils - Bookmark, Notes & More (Coming Soon)', 'utils', '#utils')
      ]);
      main.appendChild(grid);
    });

    Router.on('quran', () => QuranView.render(document.getElementById('app-main')));
    Router.on('quran/:surah', (container, params) => QuranView.render(container, params));
    Router.on('quran/tafsir/:surah/:ayah', (container, params) => QuranView.render(container, { tafsir: true, surah: params.surah, ayah: params.ayah }));
    Router.on('quran/:surah/:ayah', (container, params) => QuranView.render(container, params));

    Router.on('hadiths', () => HadithView.render(document.getElementById('app-main')));
    Router.on('hadiths/:book', (container, params) => HadithView.render(container, { book: params.book }));
    Router.on('hadiths/:book/:hadith', (container, params) => HadithView.render(container, { book: params.book, hadith: params.hadith }));
    Router.on('hadiths/:collection/:book/:hadith', (container, params) => HadithView.render(container, params));
    Router.on('hadiths/:collection/:book', (container, params) => HadithView.render(container, params));

    Router.on('salah', () => SalahView.render(document.getElementById('app-main')));

    Router.on('learn', () => LearnView.render(document.getElementById('app-main')));

    Router.on('learn/shia/:book/:hadith', (container, params) => HadithView.render(container, { collection: 'shia', book: params.book, hadith: params.hadith }));
    Router.on('learn/shia/:book', (container, params) => HadithView.render(container, { collection: 'shia', book: params.book }));
    Router.on('learn/shia', () => {
      const main = document.getElementById('app-main');
      main.innerHTML = '';
      HadithView.render(main, { collection: 'shia' });
    });

    Router.on('learn/salafiyyah/asmaulhusna/:name', (container, params) => SalafiyyahView.renderAsma(container, params));
    Router.on('learn/salafiyyah/asmaulhusna', (container) => SalafiyyahView.renderAsma(container, {}));
    Router.on('learn/salafiyyah', () => {
      SalafiyyahView.render(document.getElementById('app-main'));
    });

    Router.on('learn/other/bible/:book/:chapter/:verse', (container, params) => BibleView.renderChapter(container, params));
    Router.on('learn/other/bible/:book/:chapter', (container, params) => BibleView.renderChapter(container, params));
    Router.on('learn/other/bible/:book', (container, params) => BibleView.renderBook(container, params));
    Router.on('learn/other/bible', () => BibleView.render(document.getElementById('app-main')));
    Router.on('learn/other', () => OtherView.render(document.getElementById('app-main')));

    Router.on('utils', () => {
      const main = document.getElementById('app-main');
      main.innerHTML = `
        <div class="empty-state" style="min-height: 60vh; display: flex; flex-direction: column; align-items: center; justify-content: center;">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#F472C6" stroke-width="1.5" style="margin-bottom: var(--spacing-lg); opacity: 0.8;">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
          </svg>
          <h2 class="empty-state__title" style="color: var(--color-text);">Coming Soon</h2>
          <p class="empty-state__description" style="max-width: 400px; text-align: center;">
            Utils feature is under development. Bookmark your favorite hadiths, verses, and notes.
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
