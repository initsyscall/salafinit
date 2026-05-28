const HadithConfig = (() => {
  const SUNNI_BASE = 'https://cdn.jsdelivr.net/gh/R3GENESI5/Itqan@master/app/data/sunni';
  const SHIA_BASE = 'https://cdn.jsdelivr.net/gh/R3GENESI5/Itqan@master/app/data/shia';

  function getBaseUrl(collection) {
    return collection === 'shia' ? SHIA_BASE : SUNNI_BASE;
  }

  return { getBaseUrl, SUNNI_BASE, SHIA_BASE };
})();