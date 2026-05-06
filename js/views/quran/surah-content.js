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
  return Utils.createElement('div', { className: 'breadcrumb' }, [
    Utils.createElement('a', { className: 'breadcrumb__item', href: '#quran' }, 'Quran'),
    Utils.createElement('span', { className: 'breadcrumb__separator' }, '/'),
    Utils.createElement('span', { className: 'breadcrumb__item' }, englishName)
  ]);
}

function createSurahHeader(uthmani) {
  return Utils.createElement('div', { className: 'card quran-surah-header', style: 'margin-bottom: var(--spacing-xl); text-align: center; position: relative; overflow: hidden;' }, [
    Utils.createElement('div', { className: 'quran-surah-header__bismillah' }, QuranConfig.BISMILLAH),
    Utils.createElement('h2', { className: 'card__title quran-surah-header__title' }, uthmani.name),
    Utils.createElement('p', { className: 'card__description quran-surah-header__subtitle' }, `${uthmani.englishName} • ${uthmani.englishNameTranslation}`),
    Utils.createElement('p', { className: 'card__description' }, `${uthmani.numberOfAyahs} Ayahs • ${uthmani.revelationType}`)
  ]);
}

function createSearchWrapper() {
  const searchWrapper = Utils.createElement('div', {
    style: 'display: flex; gap: var(--spacing-sm); margin-bottom: var(--spacing-lg);'
  });
  
  const searchInput = Utils.createElement('input', {
    className: 'input quran-search-input',
    id: 'ayah-search',
    placeholder: QuranConfig.LABELS.AYAH_SEARCH_PLACEHOLDER,
    style: 'flex: 1;'
  });
  
  const goBtn = Utils.createElement('button', {
    className: 'btn btn--primary',
    style: 'padding: var(--spacing-sm) var(--spacing-md);'
  }, QuranConfig.LABELS.SEARCH_BTN);
  
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
    className: 'card quran-ayah-card',
    id: `ayah-${ayah.numberInSurah}`,
    style: `${isHighlighted ? 'border-color: var(--color-quran); box-shadow: var(--shadow-gold);' : ''}`
  });

  const ayahHeader = Utils.createElement('div', {
    style: 'display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-md); padding-bottom: var(--spacing-sm); border-bottom: 1px solid var(--color-border);'
  }, [
    Utils.createElement('div', { style: 'display: flex; align-items: center; gap: var(--spacing-sm);' }, [
      Utils.createElement('span', { className: 'badge badge--primary quran-ayah-badge' }, `${QuranConfig.LABELS.AYAH} ${ayah.numberInSurah}`),
      Utils.createElement('button', {
        className: 'btn btn--ghost btn--sm quran-tafsir-btn',
        onClick: () => {
          window.location.hash = `#quran/tafsir/${uthmani.number}/${ayah.numberInSurah}`;
        }
      }, QuranConfig.LABELS.TAFSIR_IBN_KATHIR)
    ]),
    Utils.createElement('div', { style: 'display: flex; gap: var(--spacing-xs);' }, [
      Utils.createElement('button', {
        className: 'btn btn--ghost btn--icon',
        title: 'Copy',
        innerHTML: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>',
        onClick: () => copyAyahFn(ayah, primaryTrans, uthmani)
      }),
      Utils.createElement('button', {
        className: 'btn btn--ghost btn--icon quran-share-btn',
        title: 'Share',
        innerHTML: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><polyline points="16 6 12 2 8 6"></polyline><line x1="12" y1="2" x2="12" y2="15"></line></svg>',
        onClick: () => shareAyahFn(ayah, primaryTrans, uthmani)
      }),
      Utils.createElement('a', {
        className: 'btn btn--ghost btn--icon',
        title: 'Link',
        href: `#quran/${uthmani.number}/${ayah.numberInSurah}`,
        innerHTML: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>'
      })
    ])
  ]);
  ayahCard.appendChild(ayahHeader);

  const arabicText = Utils.createElement('p', {
    className: 'rtl arab-text quran-arabic',
    innerHTML: ayah.text
  });
  ayahCard.appendChild(arabicText);

  if (primaryTrans?.text) {
    const translationsContainer = Utils.createElement('div', { 
      className: 'quran-translations-container',
      style: 'margin-top: var(--spacing-md);'
    });
    
    const primaryTransDiv = Utils.createElement('p', {
      className: 'card__description quran-translation quran-translation--primary',
      innerHTML: formatTranslation(primaryTrans.text)
    });
    translationsContainer.appendChild(primaryTransDiv);
    
    if (allTranslations && allTranslations.length > 1) {
      allTranslations.slice(1).forEach((transData, idx) => {
        const trans = transData?.data?.ayahs?.find(t => t.numberInSurah === ayah.numberInSurah);
        if (trans?.text) {
          const secTransDiv = Utils.createElement('p', {
            className: 'card__description quran-translation quran-translation--secondary',
            style: 'margin-top: var(--spacing-sm); font-size: var(--font-size-sm);',
            innerHTML: formatTranslation(trans.text)
          });
          translationsContainer.appendChild(secTransDiv);
        }
      });
    }
    
    ayahCard.appendChild(translationsContainer);
  }

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
        import('./tafsir.js').then(m => m.copyAyah(ayah, primaryTrans, uthmani));
      };
      
      const shareAyahHandler = () => {
        import('./tafsir.js').then(m => m.shareAyah(ayah, primaryTrans, uthmani));
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