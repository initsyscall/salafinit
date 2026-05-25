import QuranConfig from './config.js';

export function openSettingsModal() {
  const existing = document.querySelector('.quran-settings-overlay');
  if (existing) existing.remove();

  const currentPrimary = Store.get(QuranConfig.STORAGE_KEYS.TRANSLATION1) || QuranConfig.DEFAULTS.TRANSLATION1;
  const currentSecondary = Store.get(QuranConfig.STORAGE_KEYS.TRANSLATION2) || QuranConfig.DEFAULTS.TRANSLATION2;
  const currentTertiary = Store.get(QuranConfig.STORAGE_KEYS.TRANSLATION3) || QuranConfig.DEFAULTS.TRANSLATION3;
  const currentTafsir = Store.get(QuranConfig.STORAGE_KEYS.TAFSIR_SOURCE) || QuranConfig.DEFAULTS.TAFSIR_SOURCE;

  const overlay = Utils.createElement('div', {
    className: 'quran-settings-overlay',
    onClick: (e) => {
      if (e.target === overlay) overlay.remove();
    }
  });

  const createInput = (label, currentValue, key, placeholder) => {
    const wrapper = Utils.createElement('div', { style: 'margin-bottom: var(--spacing-md);' });
    wrapper.appendChild(Utils.createElement('label', { style: 'display: block; margin-bottom: var(--spacing-xs); font-size: var(--font-size-sm); color: var(--color-text-secondary);' }, label));
    
    const input = Utils.createElement('input', {
      type: 'text',
      className: 'input',
      id: `translation-${key}`,
      value: currentValue,
      placeholder: placeholder,
      style: 'width: 100%;'
    });
    
    wrapper.appendChild(input);
    return wrapper;
  };

  const modal = Utils.createElement('div', { className: 'quran-settings-modal', style: 'max-width: 450px;' }, [
    Utils.createElement('h3', { style: 'margin-bottom: var(--spacing-lg);' }, QuranConfig.SETTINGS.MODAL_TITLE),
    
    createInput(QuranConfig.SETTINGS.PRIMARY_LABEL, currentPrimary, '1', QuranConfig.SETTINGS.PRIMARY_PLACEHOLDER),
    createInput(QuranConfig.SETTINGS.SECONDARY_LABEL, currentSecondary, '2', QuranConfig.SETTINGS.SECONDARY_PLACEHOLDER),
    createInput(QuranConfig.SETTINGS.TERTIARY_LABEL, currentTertiary, '3', QuranConfig.SETTINGS.TERTIARY_PLACEHOLDER),

    Utils.createElement('div', { style: 'margin-bottom: var(--spacing-md);' }, [
      Utils.createElement('label', { style: 'display: block; margin-bottom: var(--spacing-xs); font-size: var(--font-size-sm); color: var(--color-text-secondary);' }, QuranConfig.SETTINGS.TAFSIR_LABEL),
      Utils.createElement('select', {
        className: 'input',
        id: 'tafsir-source',
        style: 'width: 100%;'
      }, Object.entries(QuranConfig.TAFSIR_SOURCES).map(([key, val]) =>
        Utils.createElement('option', { value: key, selected: key === currentTafsir }, val.label)
      ))
    ]),
    
    Utils.createElement('div', { style: 'background: var(--color-surface); padding: var(--spacing-md); border-radius: var(--radius-md); margin-bottom: var(--spacing-md);' }, [
      Utils.createElement('p', { style: 'font-size: var(--font-size-sm); font-weight: 600; margin-bottom: var(--spacing-sm);' }, QuranConfig.SETTINGS.HELP_TITLE),
      Utils.createElement('p', { style: 'font-size: var(--font-size-xs); color: var(--color-text-secondary); margin-bottom: var(--spacing-xs);' }, QuranConfig.SETTINGS.HELP_HILALI),
      Utils.createElement('p', { style: 'font-size: var(--font-size-xs); color: var(--color-text-secondary); margin-bottom: var(--spacing-xs);' }, QuranConfig.SETTINGS.HELP_SAHIH),
      Utils.createElement('p', { style: 'font-size: var(--font-size-xs); color: var(--color-text-secondary); margin-bottom: var(--spacing-xs);' }, QuranConfig.SETTINGS.HELP_PICKTHALL),
      Utils.createElement('p', { style: 'font-size: var(--font-size-xs); color: var(--color-text-secondary); margin-bottom: var(--spacing-xs);' }, QuranConfig.SETTINGS.HELP_YUSUFALI),
      Utils.createElement('p', { style: 'font-size: var(--font-size-xs); color: var(--color-text-secondary);' }, QuranConfig.SETTINGS.HELP_LINK)
    ]),
    
    Utils.createElement('div', { style: 'display: flex; gap: var(--spacing-sm); flex-wrap: wrap;' }, [
      Utils.createElement('button', {
        className: 'btn btn--primary',
        onClick: () => {
          const sel1 = document.getElementById('translation-1').value.trim() || QuranConfig.DEFAULTS.TRANSLATION1;
          const sel2 = document.getElementById('translation-2').value.trim();
          const sel3 = document.getElementById('translation-3').value.trim();
          const tafsir = document.getElementById('tafsir-source').value;
          
          Store.set(QuranConfig.STORAGE_KEYS.TRANSLATION1, sel1);
          Store.set(QuranConfig.STORAGE_KEYS.TRANSLATION2, sel2);
          Store.set(QuranConfig.STORAGE_KEYS.TRANSLATION3, sel3);
          Store.set(QuranConfig.STORAGE_KEYS.TAFSIR_SOURCE, tafsir);
          Utils.showToast(QuranConfig.LABELS.TRANSLATIONS_SAVED);
          overlay.remove();
          window.location.reload();
        }
      }, 'Save'),
      Utils.createElement('button', {
        className: 'btn btn--outline',
        onClick: () => {
          Store.set(QuranConfig.STORAGE_KEYS.TRANSLATION1, QuranConfig.DEFAULTS.TRANSLATION1);
          Store.set(QuranConfig.STORAGE_KEYS.TRANSLATION2, QuranConfig.DEFAULTS.TRANSLATION2);
          Store.set(QuranConfig.STORAGE_KEYS.TRANSLATION3, QuranConfig.DEFAULTS.TRANSLATION3);
          Store.set(QuranConfig.STORAGE_KEYS.TAFSIR_SOURCE, QuranConfig.DEFAULTS.TAFSIR_SOURCE);
          Utils.showToast(QuranConfig.LABELS.RESET_CONFIRM);
          overlay.remove();
          window.location.reload();
        }
      }, QuranConfig.SETTINGS.RESET_DEFAULT),
      Utils.createElement('button', {
        className: 'btn btn--ghost',
        onClick: () => overlay.remove()
      }, 'Cancel')
    ])
  ]);

  overlay.appendChild(modal);
  document.body.appendChild(overlay);
}

export default { openSettingsModal };