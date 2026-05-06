import { loadSurah, loadSurahForTafsir, loadSurahForImage } from './surah-content.js';
import { renderSurahList } from './surah-list.js';
import QuranConfig from './config.js';

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

export function route(container, params = {}) {
  container.innerHTML = '';

  const header = createPageHeader();
  container.appendChild(header);

  if (params.tafsir) {
    loadSurahForTafsir(container, params);
  } else if (params.image) {
    loadSurahForImage(container, params);
  } else if (params.surah) {
    loadSurah(container, params);
  } else {
    renderSurahList(container);
  }
}

export default { route, createPageHeader };