const TranslationModule = (() => {
  const STORAGE_KEY = 'preferred_translation_lang';
  const SUPPORTED_LANGUAGES = [
    { code: 'en', name: 'English', native: 'English' },
    { code: 'ar', name: 'Arabic', native: 'العربية' },
    { code: 'ur', name: 'Urdu', native: 'اردو' },
    { code: 'fa', name: 'Persian', native: 'فارسی' },
    { code: 'id', name: 'Indonesian', native: 'Bahasa Indonesia' },
    { code: 'ms', name: 'Malay', native: 'Bahasa Melayu' },
    { code: 'tr', name: 'Turkish', native: 'Türkçe' },
    { code: 'bn', name: 'Bengali', native: 'বাংলা' },
    { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
    { code: 'pt', name: 'Portuguese', native: 'Português' },
    { code: 'fr', name: 'French', native: 'Français' },
    { code: 'de', name: 'German', native: 'Deutsch' },
    { code: 'es', name: 'Spanish', native: 'Español' },
    { code: 'ru', name: 'Russian', native: 'Русский' },
    { code: 'zh-CN', name: 'Chinese (Simplified)', native: '中文简体' },
    { code: 'ja', name: 'Japanese', native: '日本語' },
    { code: 'ko', name: 'Korean', native: '한국어' }
  ];

  function getPreferredLanguage() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && SUPPORTED_LANGUAGES.some(l => l.code === stored)) {
      return stored;
    }
    return 'en';
  }

  function setPreferredLanguage(langCode) {
    if (SUPPORTED_LANGUAGES.some(l => l.code === langCode)) {
      localStorage.setItem(STORAGE_KEY, langCode);
      return true;
    }
    return false;
  }

  function getSupportedLanguages() {
    return SUPPORTED_LANGUAGES;
  }

  function translateText(text, targetLang = null) {
    const target = targetLang || getPreferredLanguage();
    const sourceLang = 'auto';
    const encodedText = encodeURIComponent(text);
    const url = `https://translate.google.com/?sl=${sourceLang}&tl=${target}&text=${encodedText}&op=translate`;
    window.open(url, '_blank');
  }

  function translateHadith(arabicText, englishText, targetLang = null) {
    const target = targetLang || getPreferredLanguage();
    const textToTranslate = arabicText;
    const sourceLang = 'ar';
    const encodedText = encodeURIComponent(textToTranslate);
    const url = `https://translate.google.com/?sl=${sourceLang}&tl=${target}&text=${encodedText}&op=translate`;
    window.open(url, '_blank');
  }

  return {
    getPreferredLanguage,
    setPreferredLanguage,
    getSupportedLanguages,
    translateText,
    translateHadith
  };
})();