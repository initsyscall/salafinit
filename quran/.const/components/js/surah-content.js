import { formatTranslation } from './utils.js';
import { parseSearchQuery } from './utils.js';
import QuranConfig from './config.js';

let currentSurahData = null;
let currentHilaliData = null;

function createLoader(message) {
  return Utils.createElement('div', { className: 'loader' }, [
    Utils.createElement('div', { className: 'loader__spinner loader-spinner-gold' }),
    Utils.createElement('span', { className: 'loader__text' }, message || QuranConfig.LABELS.LOADING_SURAHS)
  ]);
}

function createErrorState(message) {
  return Utils.createElement('div', { className: 'empty-state' }, [
    Utils.createElement('div', { className: 'empty-state__title' }, QuranConfig.LABELS.FAILED_TO_LOAD),
    Utils.createElement('div', { className: 'empty-state__description' }, message || QuranConfig.LABELS.COULD_NOT_LOAD_SURAH),
    Utils.createElement('a', { className: 'btn btn--primary', href: '#quran', style: 'margin-top: var(--spacing-xl); display: inline-block;' }, QuranConfig.LABELS.BACK_TO_SURAH_LIST)
  ]);
}

function getTranslations() {
  return [
    Store.get(QuranConfig.STORAGE_KEYS.TRANSLATION1) || QuranConfig.DEFAULTS.TRANSLATION1,
    Store.get(QuranConfig.STORAGE_KEYS.TRANSLATION2),
    Store.get(QuranConfig.STORAGE_KEYS.TRANSLATION3)
  ].filter(Boolean);
}

function createBreadcrumb(englishName) {
  return Utils.createElement('div', { 
    className: 'breadcrumb', 
    style: 'margin-bottom: 0.5rem;'
  }, [
    Utils.createElement('a', { className: 'breadcrumb__item', href: '#quran' }, 'Quran'),
    Utils.createElement('span', { className: 'breadcrumb__separator' }, '/'),
    Utils.createElement('span', { className: 'breadcrumb__item' }, englishName)
  ]);
}

function createSurahHeader(uthmani) {
  return Utils.createElement('div', { className: 'quran-surah-header' }, [
    Utils.createElement('h2', { className: 'quran-surah-header__title' }, uthmani.name),
    Utils.createElement('p', { className: 'quran-surah-header__subtitle' }, `${uthmani.englishName}`)
  ]);
}

function createSearchWrapper() {
  const searchWrapper = Utils.createElement('div', { className: 'quran-search-wrapper' });
  
  const searchInput = Utils.createElement('input', {
    className: 'input quran-search-input',
    id: 'ayah-search',
    placeholder: 'Search ayah...'
  });
  
  const goBtn = Utils.createElement('button', {
    className: 'btn btn--ghost'
  }, 'Go');
  
  searchWrapper.appendChild(searchInput);
  searchWrapper.appendChild(goBtn);
  
  return { wrapper: searchWrapper, input: searchInput, btn: goBtn };
}

function createScrollToTopBtn() {
  return Utils.createElement('button', {
    className: 'scroll-to-top',
    innerHTML: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="18 15 12 9 6 15"></polyline></svg>',
    onClick: () => window.scrollTo({ top: 0, behavior: 'smooth' })
  });
}

function createAyahCard(ayah, primaryTrans, isHighlighted, uthmani, allTranslations, openTafsirFn, copyAyahFn, shareAyahFn) {
  const ayahCard = Utils.createElement('div', {
    className: 'quran-ayah-card',
    id: `ayah-${ayah.numberInSurah}`,
  });

  const headerRow = Utils.createElement('div', { className: 'quran-ayah-header' });
  
  const leftSide = Utils.createElement('div', { className: 'quran-ayah-left' });
  const ayahNumber = Utils.createElement('span', {
    className: 'quran-ayah-number'
  }, `${ ayah.numberInSurah}`);
  const surahName = Utils.createElement('span', {
    className: 'quran-ayah-surah-name'
  }, ` ${uthmani.englishName}`);
  leftSide.appendChild(ayahNumber);
  leftSide.appendChild(surahName);
  
  const tafsirLink = Utils.createElement('a', {
    className: 'quran-tafsir-link',
    href: `#quran/tafsir/${uthmani.number}/${ayah.numberInSurah}`
  }, 'Tafsir Ibn Kathir');
  
  headerRow.appendChild(leftSide);
  headerRow.appendChild(tafsirLink);
  ayahCard.appendChild(headerRow);

  const arabicText = Utils.createElement('p', {
    className: 'quran-arabic',
    innerHTML: ayah.text
  });
  ayahCard.appendChild(arabicText);

  if (primaryTrans?.text) {
    const primaryTransDiv = Utils.createElement('p', {
      className: 'quran-translation',
      innerHTML: formatTranslation(primaryTrans.text)
    });
    ayahCard.appendChild(primaryTransDiv);
  }

  const actions = Utils.createElement('div', { className: 'quran-ayah-actions' }, [
    Utils.createElement('button', {
      className: 'btn btn--ghost',
      title: 'Share',
      innerHTML: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><polyline points="16 6 12 2 8 6"></polyline><line x1="12" y1="2" x2="12" y2="15"></line></svg>',
      onClick: () => shareAyahFn(ayah, primaryTrans, uthmani)
    }),
    Utils.createElement('a', {
      className: 'btn btn--ghost',
      title: 'Link',
      href: `#quran/${uthmani.number}/${ayah.numberInSurah}`,
      innerHTML: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>'
    }),
    Utils.createElement('button', {
      className: 'btn btn--ghost',
      title: 'Copy',
      innerHTML: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>',
      onClick: () => copyAyahFn(ayah, primaryTrans, uthmani)
    })
  ]);
  ayahCard.appendChild(actions);

  return ayahCard;
}

export function renderSurahContent(container, uthmani, primaryTranslation, highlightAyah = null, allTranslations = []) {
  container.innerHTML = '';

  const breadcrumb = createBreadcrumb(uthmani.englishName);
  container.appendChild(breadcrumb);

  const surahHeader = createSurahHeader(uthmani);
  container.appendChild(surahHeader);

  const { wrapper: searchWrapper, input: searchInput, btn: goBtn } = createSearchWrapper();
  container.appendChild(searchWrapper);

  const ayahsContainer = Utils.createElement('div', { id: 'ayahs-list' });

  function renderAyahs(filteredAyahs) {
    ayahsContainer.innerHTML = '';
    filteredAyahs.forEach((ayah) => {
      const primaryTrans = primaryTranslation?.ayahs?.find(t => t.numberInSurah === ayah.numberInSurah);
      const isHighlighted = highlightAyah && String(ayah.numberInSurah) === String(highlightAyah);

      const copyAyahHandler = () => {
        import('./tafsir.js?t=' + Date.now()).then(m => m.copyAyah(ayah, primaryTrans, uthmani));
      };
      
      const shareAyahHandler = () => {
        import('./tafsir.js?t=' + Date.now()).then(m => m.shareAyah(ayah, primaryTrans, uthmani));
      };
      
      const ayahCard = createAyahCard(
        ayah,
        primaryTrans,
        isHighlighted,
        uthmani,
        allTranslations,
        () => window.location.hash = `#quran/tafsir/${uthmani.number}/${ayah.numberInSurah}`,
        copyAyahHandler,
        shareAyahHandler
      );
      ayahsContainer.appendChild(ayahCard);
    });

    if (highlightAyah) {
      setTimeout(() => {
        const highlighted = document.getElementById(`ayah-${highlightAyah}`);
        if (highlighted) {
          highlighted.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  }

  renderAyahs(uthmani.ayahs);

  const searchHandler = Utils.debounce((e) => {
    const query = e.target.value.trim();
    
    if (!query) {
      renderAyahs(uthmani.ayahs);
      return;
    }

    const queryLower = query.toLowerCase();
    const isAyahNumber = /^\d+$/.test(query) || /^\d+:\d+$/.test(query);

    let filtered;
    if (isAyahNumber) {
      const ayahNum = parseInt(query.split(':').pop());
      filtered = uthmani.ayahs.filter(ayah => ayah.numberInSurah === ayahNum);
    } else {
      filtered = uthmani.ayahs.filter((ayah) => {
        const primaryTrans = primaryTranslation?.ayahs?.find(t => t.numberInSurah === ayah.numberInSurah);
        return String(ayah.numberInSurah).includes(queryLower) ||
          ayah.text.toLowerCase().includes(queryLower) ||
          primaryTrans?.text?.toLowerCase().includes(queryLower);
      });
    }
    
    if (filtered.length === 0) {
      ayahsContainer.innerHTML = `<div class="empty-state" style="text-align: center; padding: var(--spacing-xl);"><p>${QuranConfig.LABELS.NO_RESULTS}${query}${QuranConfig.LABELS.TRY_DIFFERENT_SEARCH}</p></div>`;
    } else {
      renderAyahs(filtered);
    }
  }, 300);

  searchInput.addEventListener('input', searchHandler);
  goBtn.addEventListener('click', () => searchHandler({ target: searchInput }));

  container.appendChild(ayahsContainer);

  const scrollToTopBtn = createScrollToTopBtn();
  container.appendChild(scrollToTopBtn);
}

export async function loadSurah(container, params) {
  const loader = createLoader(`${QuranConfig.LABELS.LOADING_SURAH}${params.surah}...`);
  container.appendChild(loader);

  const translations = getTranslations();

  try {
    const [uthmaniData, ...translationData] = await Promise.all([
      QuranApi.getSurah(params.surah, 'quran-uthmani'),
      ...translations.map(t => QuranApi.getSurah(params.surah, t))
    ]);

    loader.remove();
    currentSurahData = uthmaniData.data;
    currentHilaliData = translationData[0]?.data || null;
    renderSurahContent(container, uthmaniData.data, currentHilaliData, params.ayah, translationData);
  } catch (error) {
    loader.remove();
    container.appendChild(createErrorState());
  }
}

export async function loadSurahForTafsir(container, params) {
  const translations = getTranslations();

  try {
    const [uthmaniData, ...translationData] = await Promise.all([
      QuranApi.getSurah(params.surah, 'quran-uthmani'),
      ...translations.map(t => QuranApi.getSurah(params.surah, t))
    ]);
    currentSurahData = uthmaniData.data;
    currentHilaliData = translationData[0]?.data || null;
    renderSurahContent(container, uthmaniData.data, currentHilaliData, params.ayah, translationData);
    
    setTimeout(() => import('./tafsir.js').then(m => m.openTafsirModal(params.surah, params.ayah, uthmaniData.data, currentHilaliData)), 300);
  } catch (error) {
    container.appendChild(createErrorState(QuranConfig.LABELS.COULD_NOT_LOAD_SURAH));
  }
}

export async function loadSurahForImage(container, params) {
  const translations = getTranslations();

  try {
    const [uthmaniData, ...translationData] = await Promise.all([
      QuranApi.getSurah(params.surah, 'quran-uthmani'),
      ...translations.map(t => QuranApi.getSurah(params.surah, t))
    ]);
    const ayah = uthmaniData.data.ayahs.find(a => a.numberInSurah == params.ayah);
    const translation = translationData[0]?.data?.ayahs?.find(a => a.numberInSurah == params.ayah);
    
    if (ayah) {
      setTimeout(() => import('./tafsir.js').then(m => m.shareAyah(ayah, translation, uthmaniData.data, true)), 300);
    }
    renderSurahContent(container, uthmaniData.data, translationData[0]?.data, params.ayah, translationData);
  } catch (error) {
    container.appendChild(createErrorState(QuranConfig.LABELS.COULD_NOT_LOAD_SURAH));
  }
}

export function createPageHeader() {
  return Utils.createElement('div', { className: 'page-header', style: 'position: relative;' }, [
    Utils.createElement('h1', { className: 'page-header__title quran-title' }, QuranConfig.PAGE_TITLE),
    Utils.createElement('p', { className: 'page-header__subtitle' }, QuranConfig.PAGE_SUBTITLE),
    Utils.createElement('button', {
      className: 'quran-settings-btn',
      onClick: () => import('./settings.js').then(m => m.openSettingsModal())
    }, '⚙')
  ]);
}

export default { renderSurahContent, loadSurah, loadSurahForTafsir, loadSurahForImage, createPageHeader };