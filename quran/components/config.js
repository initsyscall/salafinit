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
    RESET_CONFIRM: 'Reset to defaults! Reloading...',
    TRANSLATIONS_SAVED: 'Translations saved! Reloading...',
  },

  SETTINGS: {
    MODAL_TITLE: 'Quran Settings',
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
    TAFSIR_LABEL: 'Tafsir Source:',
    RECITER_LABEL: 'Reciter (Audio):',
    RESET_DEFAULT: 'Reset to Default',
  },

  TAFSIR_SOURCES: {
    ibnkathir: { name: 'Tafsir Ibn Kathir', label: 'Ibn Kathir (English)' },
    muyassar: { name: 'Tafsir Muyassar', label: 'Muyassar (Arabic)' },
  },

  RECITERS: {
    2: { name: 'Abdul Rahman Al-Sudais', path: 'Abdurrahmaan_As-Sudais_192kbps' },
    3: { name: 'Abdul Basit Abdul Samad', path: 'Abdul_Basit_Murattal_192kbps' },
    4: { name: 'Abdul Basit (Mujawwad)', path: 'Abdul_Basit_Mujawwad_128kbps' },
    5: { name: 'Maher Al Muaiqly', path: 'MauroAuad-AlMuaiqly_128kbps' },
    6: { name: 'Saad Al-Ghamdi', path: 'Saad_Al-Ghamdi_64kbps' },
    7: { name: 'Hani Ar-Rifai', path: 'Hani_Rifai_192kbps' },
    8: { name: 'Abu Bakr Al Shatri', path: 'Abu_Bakr_Ash-Shaatree_128kbps' },
    9: { name: 'Yasser Al-Dosari', path: 'Yasser_Ad-Dussary_128kbps' },
    10: { name: 'Saud Al-Shuraim', path: 'Saood_ash-Shuraym_128kbps' },
    11: { name: 'Abdullah Al-Juhany', path: 'Abdullaah_3awwaad_Al-Juhaynee_128kbps' },
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
    TAFSIR_SOURCE: 'quranTafsirSource',
    RECITER: 'quranReciter',
  },

  DEFAULTS: {
    TRANSLATION1: 'en.hilali',
    TRANSLATION2: '',
    TRANSLATION3: '',
    TAFSIR_SOURCE: 'ibnkathir',
    RECITER: '9',
  },

  BISMILLAH: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ',

  COPY_SUFFIX: '\n\n- salafInit',
};

export default QuranConfig;