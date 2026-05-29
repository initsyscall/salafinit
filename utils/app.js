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
        Utils.createElement('div', { id: 'hero-verse', className: 'home-verse' })
      ]);
      main.appendChild(hero);

      loadRandomVerse();

      const grid = Utils.createElement('div', { className: 'grid grid--responsive home-grid' }, [
        createFeatureCard('ٱلْقُرْآن', 'The Noble Quran - Uthmani Text with Translation and Tafsir', 'quran', '#quran'),
        createFeatureCard('ٱلْحَدِيثُ', 'Hadith Collections - Kutub al-Sittah + More', 'hadith', '#hadiths'),
        createFeatureCard('ٱلصَّلَاةُ', 'Salah Timings - Prayer times based on your location', 'salah', '#salah'),
        createFeatureCard('ٱلْعِلْمُ', 'Learn Salafiyyah, shia & other religion', 'learn', '#learn'),
        createFeatureCard('ٱلْأَدَوَاتُ', 'Utils - Bookmark, Quran Progress & Tools', 'utils', '#utils')
      ]);
      main.appendChild(grid);
    });

    Router.on('quran', () => QuranView.render(document.getElementById('app-main')));
    Router.on('quran/:surah', (container, params) => QuranView.render(container, params));
    Router.on('quran/tafsir/:source/:surah/:ayah', (container, params) => QuranView.render(container, { tafsir: true, tafsirSource: params.source, surah: params.surah, ayah: params.ayah }));
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

    Router.on('learn/salafiyyah/duas/:id', (container, params) => SalafiyyahView.renderDuas(container, params));
    Router.on('learn/salafiyyah/duas', (container) => SalafiyyahView.renderDuas(container, {}));
    Router.on('learn/salafiyyah/asmaulhusna/:name', (container, params) => SalafiyyahView.renderAsma(container, params));
    Router.on('learn/salafiyyah/asmaulhusna', (container) => SalafiyyahView.renderAsma(container, {}));
    Router.on('learn/salafiyyah', () => {
      SalafiyyahView.render(document.getElementById('app-main'));
    });

    Router.on('learn/other/hinduism/:book/:chapter/:verse', (container, params) => HinduismView.renderChapter(container, params));
    Router.on('learn/other/hinduism/:book/:chapter', (container, params) => HinduismView.renderChapter(container, params));
    Router.on('learn/other/hinduism/:book', (container, params) => HinduismView.renderBook(container, params));
    Router.on('learn/other/hinduism', () => HinduismView.render(document.getElementById('app-main')));
    Router.on('learn/other/judaism/:book/:chapter/:verse', (container, params) => JudaismView.renderChapter(container, params));
    Router.on('learn/other/judaism/:book/:chapter', (container, params) => JudaismView.renderChapter(container, params));
    Router.on('learn/other/judaism/:book', (container, params) => JudaismView.renderBook(container, params));
    Router.on('learn/other/judaism', () => JudaismView.render(document.getElementById('app-main')));
    Router.on('learn/other/bible/:book/:chapter/:verse', (container, params) => BibleView.renderChapter(container, params));
    Router.on('learn/other/bible/:book/:chapter', (container, params) => BibleView.renderChapter(container, params));
    Router.on('learn/other/bible/:book', (container, params) => BibleView.renderBook(container, params));
    Router.on('learn/other/bible', () => BibleView.render(document.getElementById('app-main')));
    Router.on('learn/other', () => OtherView.render(document.getElementById('app-main')));

    Router.on('utils', () => {
      const main = document.getElementById('app-main');
      main.innerHTML = `
        <div class="utils-page" style="max-width:600px;margin:0 auto;padding:var(--spacing-lg);">
          <h1 style="font-size:var(--font-size-2xl);font-weight:500;letter-spacing:-0.02em;margin:0 0 var(--spacing-xs);">الأدوات</h1>
          <p style="font-size:var(--font-size-sm);color:var(--color-text-muted);opacity:0.6;margin:0 0 var(--spacing-xl);">Utilities</p>
          <div class="grid grid--responsive" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:var(--spacing-md);">
            <a href="#utils/bookmarks" class="card feature-card" style="text-decoration:none;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:var(--spacing-xl) var(--spacing-md);min-height:100px;">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="1.5" style="margin-bottom:var(--spacing-sm);"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
              <span style="font-size:var(--font-size-sm);font-weight:600;color:var(--color-text);">Bookmarks</span>
              <span style="font-size:var(--font-size-xs);color:var(--color-text-muted);opacity:0.6;margin-top:2px;">Save ayah &amp; hadith</span>
            </a>
            <a href="#utils/quran-progress" class="card feature-card" style="text-decoration:none;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:var(--spacing-xl) var(--spacing-md);min-height:100px;">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="1.5" style="margin-bottom:var(--spacing-sm);"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
              <span style="font-size:var(--font-size-sm);font-weight:600;color:var(--color-text);">Quran Progress</span>
              <span style="font-size:var(--font-size-xs);color:var(--color-text-muted);opacity:0.6;margin-top:2px;">Track your reading</span>
            </a>
          </div>
        </div>
      `;
    });

    Router.on('utils/bookmarks', () => Bookmark.render(document.getElementById('app-main')));
    Router.on('utils/quran-progress', () => QuranProgress.render(document.getElementById('app-main')));

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

  async function loadRandomVerse() {
    const el = document.getElementById('hero-verse');
    if (!el) return;
    try {
      const data = await ApiClient.fetchApi('https://ummahapi.com/api/quran/random', { cache: false });
      const verse = data.data.verse;
      const surah = data.data.surah;
      const [surahNum, ayahNum] = verse.verse_key.split(':');
      el.innerHTML = `
        <div class="home-verse__translation">${verse.translations.sahih_international}</div>
        <div class="home-verse__ref">— Qur'an ${surah.name_english} ${verse.verse_key}</div>
      `;
      el.style.cursor = 'pointer';
      el.onclick = () => { window.location.hash = `#quran/${surahNum}/${ayahNum}`; };
    } catch {
      el.innerHTML = '<div class="home-verse__ref" style="opacity:0.4;">﴿ رَبِّ زِدْنِي عِلْمًا ﴾</div>';
    }
  }

  return { init };
})();

document.addEventListener('DOMContentLoaded', () => App.init());
