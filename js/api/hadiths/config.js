const HadithConfig = (() => {
  const SUNNI_BASE = 'https://raw.githubusercontent.com/R3GENESI5/Itqan/master/app/data/sunni';
  const SHIA_BASE = 'https://raw.githubusercontent.com/R3GENESI5/Itqan/master/app/data/shia';

  function getBaseUrl(collection) {
    return collection === 'shia' ? SHIA_BASE : SUNNI_BASE;
  }

  return { getBaseUrl, SUNNI_BASE, SHIA_BASE };
})();