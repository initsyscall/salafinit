const QuranApiConfig = {
  BASE_URL: 'https://api.alquran.cloud/v1',
  QURAN_COM_BASE: 'https://api.quran.com/api/v4',

  EDITIONS: {
    UTHMANI: 'quran-uthmani',
    HILALI: 'en.hilali',
    SAHIH: 'en.sahih',
    PICKTHALL: 'en.pickthall',
    YUSUFALI: 'en.yusufali',
    HALEEM: 'en.haleem',
    IBN_KATHIR: 'en.ibn-kathir',
    TAFSIR_IBN_KATHIR: 'en-tafsir-ibn-kathir',
  },

  AVAILABLE_TRANSLATIONS: {
    'en.hilali': 'Hilali & Khan',
    'en.sahih': 'Saheeh International',
    'en.pickthall': 'Pickthall',
    'en.yusufali': 'Yusuf Ali',
    'en.haleem': 'Haleem',
    'en.daryabadi': 'Daryabadi',
    'en.saqi': 'Saqi',
    'en.mubarakpuri': 'Mubarakpuri',
    'en.qaribullah': 'Qaribullah',
    'en.alandalus': 'Arberry',
  },

  SEARCH: {
    DEFAULT_PAGE: 1,
    DEFAULT_PER_PAGE: 20,
  },

  CACHE_TTL: 7 * 24 * 60 * 60 * 1000,
};

export default QuranApiConfig;