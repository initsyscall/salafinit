const QuranConfig = {
  PAGE_TITLE: 'The Noble Quran',
  PAGE_SUBTITLE: 'Uthmani Text with Al-Hilali Translation and Tafsir Ibn Kathir',

  LABELS: {
    LOADING_SURAHS: 'Loading Surahs...',
    LOADING_SURAH: 'Loading Surah ',
    SEARCH_PLACEHOLDER: 'Surah 1, ayah 2:286, or a word...',
    AYAH_SEARCH_PLACEHOLDER: 'Search ayah number or text...',
    SEARCH_BTN: 'Go',
    AYAH: 'Ayah',
    TAFSIR_IBN_KATHIR: 'Tafsir Ibn Kathir',
    LOADING_TAFSIR: 'Loading tafsir...',
    TAFSIR_NOT_AVAILABLE: 'Tafsir not available for this ayah.',
    TAFSIR_FAILED: 'Failed to load tafsir: ',
    FAILED_TO_LOAD: 'Failed to Load',
    COULD_NOT_LOAD_SURAH: 'Could not load surah. Please check your connection.',
    COULD_NOT_LOAD_SURAHLIST: 'Could not load surah list. Please check your connection.',
    BACK_TO_SURAH_LIST: 'Back to Surah List',
    NO_RESULTS: 'No results found for "',
    TRY_DIFFERENT_SEARCH: '". Try a different search.',
    RESET_CONFIRM: 'Reset to Al-Hilali! Reloading...',
    TRANSLATIONS_SAVED: 'Translations saved! Reloading...',
  },

  SETTINGS: {
    MODAL_TITLE: 'Quran Translation Settings',
    PRIMARY_LABEL: 'Primary Translation (e.g., en.hilali)',
    SECONDARY_LABEL: 'Secondary Translation (optional)',
    TERTIARY_LABEL: 'Tertiary Translation (optional)',
    PRIMARY_PLACEHOLDER: 'en.hilali',
    SECONDARY_PLACEHOLDER: 'en.sahih',
    TERTIARY_PLACEHOLDER: 'en.pickthall',
    HELP_TITLE: 'Common Translation Identifiers:',
    HELP_HILALI: '• en.hilali - Hilali & Khan',
    HELP_SAHIH: '• en.sahih - Saheeh International',
    HELP_PICKTHALL: '• en.pickthall - Pickthall',
    HELP_YUSUFALI: '• en.yusufali - Yusuf Ali',
    HELP_HALEEM: '• en.haleem - Haleem',
    HELP_LINK: 'Find more at api.alquran.cloud/v1/edition?type=translation',
  },

  TOAST: {
    COPIED: ' copied to clipboard!',
    FAILED_COPY: 'Failed to copy',
    LINK_COPIED: 'Link copied to clipboard!',
    FAILED_LINK: 'Failed to copy link',
    IMAGE_DOWNLOADED: 'Image downloaded!',
    IMAGE_FAILED: 'Failed to generate image',
    IMAGE_NOT_SUPPORTED: 'Image generation not supported in this browser',
  },

  SHARE: {
    APP_NAME: 'salaf.Init();',
    TEMPLATE_BG: 'linear-gradient(135deg, #161423 0%, #201D33 50%, #2A2647 100%)',
    BORDER_COLOR: '#A277FF',
    TEXT_PRIMARY: '#80FFEA',
    TEXT_SECONDARY: '#908CAA',
    ACCENT: '#A277FF',
    ACCENT_CYAN: '#80FFEA',
  },

  STORAGE_KEYS: {
    TRANSLATION1: 'quranTranslation1',
    TRANSLATION2: 'quranTranslation2',
    TRANSLATION3: 'quranTranslation3',
  },

  DEFAULTS: {
    TRANSLATION1: 'en.hilali',
    TRANSLATION2: '',
    TRANSLATION3: '',
  },

  BISMILLAH: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ',

  COPY_SUFFIX: '\n\n- salafInit',
};

export default QuranConfig;