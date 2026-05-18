import { formatTafsirText } from './utils.js';
import QuranConfig from './config.js';

let currentTafsirModal = null;

export function closeTafsirModal() {
  if (currentTafsirModal) {
    currentTafsirModal.remove();
    currentTafsirModal = null;
  }
}

export function openTafsirModal(surahNumber, ayahNumber, surahData, hilaliData) {
  closeTafsirModal();

  const ayah = surahData.ayahs?.find(a => a.numberInSurah == ayahNumber);
  const translation = hilaliData?.ayahs?.find(a => a.numberInSurah == ayahNumber);

  const overlay = Utils.createElement('div', {
    className: 'quran-tafsir-modal-overlay',
    onClick: (e) => {
      if (e.target === overlay) {
        closeTafsirModal();
        window.location.hash = `#quran/${surahNumber}/${ayahNumber}`;
      }
    }
  });

  const modal = Utils.createElement('div', { className: 'quran-tafsir-modal' }, [
    Utils.createElement('div', { className: 'quran-tafsir-modal-header' }, [
      Utils.createElement('div', { className: 'quran-tafsir-modal-title' }, [
        Utils.createElement('span', {}, QuranConfig.LABELS.TAFSIR_IBN_KATHIR),
        Utils.createElement('span', { className: 'quran-tafsir-modal-subtitle' }, `${surahData.englishName} - Ayah ${ayahNumber}`)
      ]),
      Utils.createElement('button', {
        className: 'quran-tafsir-modal-close',
        onClick: () => {
          closeTafsirModal();
          window.location.hash = `#quran/${surahNumber}/${ayahNumber}`;
        }
      }, '✕')
    ]),
    Utils.createElement('div', { className: 'quran-tafsir-modal-body' }, [
      ayah ? Utils.createElement('p', {
        className: 'rtl arab-text quran-tafsir-modal-arabic',
        innerHTML: ayah.text
      }) : null,
      translation?.text ? Utils.createElement('p', {
        className: 'quran-tafsir-modal-translation',
        textContent: translation.text
      }) : null,
      Utils.createElement('div', { className: 'quran-tafsir-modal-divider' }),
      Utils.createElement('div', {
        className: 'quran-tafsir-modal-content',
        id: 'tafsir-content'
      }, QuranConfig.LABELS.LOADING_TAFSIR)
    ]),
    Utils.createElement('div', { className: 'quran-tafsir-modal-footer' }, [
      Utils.createElement('button', {
        className: 'btn btn--ghost btn--sm',
        onClick: () => copyTafsir(surahData, ayahNumber, translation)
      }, 'Copy'),
      Utils.createElement('button', {
        className: 'btn btn--ghost btn--sm',
        onClick: () => shareTafsirLink(surahNumber, ayahNumber)
      }, 'Share Link'),
      Utils.createElement('button', {
        className: 'btn btn--primary btn--sm',
        onClick: () => {
          closeTafsirModal();
          window.location.hash = `#quran/${surahNumber}/${ayahNumber}`;
        }
      }, 'Close')
    ])
  ]);

  overlay.appendChild(modal);
  document.body.appendChild(overlay);
  currentTafsirModal = overlay;

  loadTafsirContent(surahNumber, ayahNumber);
}

export async function loadTafsirContent(surahNumber, ayahNumber) {
  const contentDiv = document.getElementById('tafsir-content');
  if (!contentDiv) {
    console.error('tafsir-content element not found');
    return;
  }

  contentDiv.innerHTML = '';
  contentDiv.appendChild(Utils.createElement('div', { className: 'loader' }, [
    Utils.createElement('div', { className: 'loader__spinner loader-spinner-gold' }),
    Utils.createElement('span', {}, QuranConfig.LABELS.LOADING_TAFSIR)
  ]));

  try {
    const tafsir = await TafsirApi.getVerseTafsir(surahNumber, ayahNumber);
    contentDiv.innerHTML = '';

    if (tafsir?.text) {
      const formatted = formatTafsirText(tafsir.text);
      contentDiv.innerHTML = formatted;
    } else {
      contentDiv.appendChild(Utils.createElement('p', { style: 'color: var(--color-text-secondary); text-align: center;' }, QuranConfig.LABELS.TAFSIR_NOT_AVAILABLE));
    }
  } catch (error) {
    console.error('Tafsir load error:', error);
    contentDiv.innerHTML = '';
    contentDiv.appendChild(Utils.createElement('p', { style: 'color: var(--color-danger); text-align: center;' }, QuranConfig.LABELS.TAFSIR_FAILED + error.message));
  }
}

export function copyTafsir(surahData, ayahNumber, translation) {
  const contentDiv = document.getElementById('tafsir-content');
  if (!contentDiv) return;

  const textToCopy = `Tafsir Ibn Kathir - ${surahData.englishName} Ayah ${ayahNumber}\n\n${translation?.text || ''}\n\n${contentDiv.textContent || ''}`;

  navigator.clipboard.writeText(textToCopy).then(() => {
    Utils.showToast('Tafsir' + QuranConfig.TOAST.COPIED);
  }).catch(() => {
    Utils.showToast(QuranConfig.TOAST.FAILED_COPY, 'error');
  });
}

export function shareTafsirLink(surahNumber, ayahNumber) {
  const url = `${window.location.origin}${window.location.pathname}#quran/tafsir/${surahNumber}/${ayahNumber}`;
  navigator.clipboard.writeText(url).then(() => {
    Utils.showToast(QuranConfig.TOAST.LINK_COPIED);
  }).catch(() => {
    Utils.showToast(QuranConfig.TOAST.FAILED_LINK, 'error');
  });
}

export function copyAyah(ayah, translation, surah) {
  const surahName = surah.arabicName 
    ? `${surah.englishName} (${surah.arabicName})` 
    : surah.englishName;
  const link = `${window.location.origin}${window.location.pathname}#quran/${surah.number}/${ayah.numberInSurah}`;
  const textToCopy = `${surahName} - ${ayah.numberInSurah}\n\n${ayah.text}\n\n${translation?.text || ''}\n\nLink: ${link}`;
  navigator.clipboard.writeText(textToCopy).then(() => {
    Utils.showToast('Ayah' + QuranConfig.TOAST.COPIED);
  }).catch(() => {
    Utils.showToast(QuranConfig.TOAST.FAILED_COPY, 'error');
  });
}

export async function shareAyah(ayah, translation, surah, isImageMode = false) {
  const existingModal = document.querySelector('.quran-share-modal');
  if (existingModal) existingModal.remove();

  const imageUrl = `#quran/image/${surah.number}/${ayah.numberInSurah}`;
  const appUrl = `#quran/${surah.number}/${ayah.numberInSurah}`;

  const template = Utils.createElement('div', {
    className: 'quran-share-template',
    style: `padding: 24px; background: ${QuranConfig.SHARE.TEMPLATE_BG}; border: 2px solid ${QuranConfig.SHARE.BORDER_COLOR}; border-radius: 12px; max-width: 600px; max-height: calc(100vh - 180px); color: #E0DEF4; overflow-y: auto;`
  }, [
    Utils.createElement('p', {
      style: 'font-size: 12px; color: #80FFEA; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 2px;'
    }, `${surah.englishName} - Ayah ${ ayah.numberInSurah}`),
    Utils.createElement('p', {
      className: 'rtl arab-text',
      style: 'font-size: 24px; line-height: 2; margin-bottom: 16px; color: #80FFEA; text-align: center; font-family: var(--font-arabic);'
    }, ayah.text),
    translation?.text ? Utils.createElement('p', {
      style: 'font-size: 14px; line-height: 1.6; color: #908CAA; margin-bottom: 16px; text-align: center;'
    }, `"${translation.text}"`) : null,
    Utils.createElement('div', { style: 'display: flex; justify-content: center; align-items: center; border-top: 1px solid #322D4A; padding-top: 12px; font-size: 12px; flex-shrink: 0;' }, [
      Utils.createElement('span', { style: 'color: #A277FF;' }, QuranConfig.SHARE.APP_NAME)
    ])
  ]);

  const closeShareModal = () => {
    document.querySelector('.quran-share-modal')?.remove();
    document.body.style.overflow = '';
    if (isImageMode) {
      window.location.hash = appUrl;
    }
  };

  const modal = Utils.createElement('div', {
    className: 'quran-share-modal',
    style: 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.9); z-index: 9999; padding: 80px 20px 100px; display: flex; flex-direction: column; justify-content: flex-start; align-items: center; overflow-y: auto; -webkit-overflow-scrolling: touch;'
  }, [
    template,
    Utils.createElement('div', { style: 'margin-top: 20px; display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; flex-shrink: 0; z-index: 10;' }, [
      Utils.createElement('button', {
        className: 'btn btn--primary',
        onClick: () => generateShareImage(template, ayah, surah)
      }, 'Download Image'),
      Utils.createElement('button', {
        className: 'btn btn--outline',
        onClick: () => {
          navigator.clipboard.writeText(window.location.origin + window.location.pathname + imageUrl).then(() => {
            Utils.showToast(QuranConfig.TOAST.LINK_COPIED);
          });
        }
      }, 'Copy Link'),
      isImageMode ? Utils.createElement('a', {
        className: 'btn btn--ghost',
        href: appUrl,
        style: 'text-decoration: none;'
      }, 'Open in App') : null,
      Utils.createElement('button', {
        className: 'btn btn--ghost',
        onClick: closeShareModal
      }, 'Close')
    ])
  ]);
  
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeShareModal();
  });
  
  document.body.appendChild(modal);
  document.body.style.overflow = 'hidden';
}

export async function generateShareImage(template, ayah, surah) {
  try {
    if (typeof snapdom !== 'undefined') {
      const img = await snapdom.toPng(template, { scale: 2 });
      const a = document.createElement('a');
      a.href = img.src;
      a.download = `quran-${surah.number}-${ayah.numberInSurah}.png`;
      a.click();
      Utils.showToast(QuranConfig.TOAST.IMAGE_DOWNLOADED);
    } else {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = template.offsetWidth;
      canvas.height = template.offsetHeight;

      try {
        const svgData = `
          <svg xmlns="http://www.w3.org/2000/svg" width="${template.offsetWidth}" height="${template.offsetHeight}">
            <foreignObject width="100%" height="100%">
              <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: sans-serif;">
                ${template.outerHTML}
              </div>
            </foreignObject>
          </svg>
        `;
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0);
          const link = document.createElement('a');
          link.download = `quran-${surah.number}-${ayah.numberInSurah}.png`;
          link.href = canvas.toDataURL('image/png');
          link.click();
          Utils.showToast(QuranConfig.TOAST.IMAGE_DOWNLOADED);
        };
        img.src = 'data:image/svg+xml,' + encodeURIComponent(svgData);
      } catch (err) {
        console.error('SVG fallback error:', err);
        Utils.showToast(QuranConfig.TOAST.IMAGE_NOT_SUPPORTED, 'error');
      }
    }
  } catch (error) {
    console.error('Share image error:', error);
    Utils.showToast(QuranConfig.TOAST.IMAGE_FAILED, 'error');
  }
}

export default {
  openTafsirModal,
  closeTafsirModal,
  loadTafsirContent,
  copyTafsir,
  shareTafsirLink,
  copyAyah,
  shareAyah,
  generateShareImage,
};