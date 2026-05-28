const TafsirApi = (() => {
  async function getIbnKathir(surah, ayah) {
    const res = await fetch(`https://api.quran.com/api/v4/tafsirs/169/by_ayah/${surah}:${ayah}`);
    if (!res.ok) throw new Error('Tafsir not available for this verse.');
    const data = await res.json();
    return { text: data.tafsir.text };
  }

  async function getMuyassar(surah, ayah) {
    const data = await ApiClient.fetchApi(`https://ummahapi.com/api/tafsir/muyassar/surah/${surah}/ayah/${ayah}`, { cache: false });
    return { text: data.data.tafsir.text };
  }

  async function getVerseTafsir(surah, ayah, source) {
    if (source === 'muyassar') return getMuyassar(surah, ayah);
    return getIbnKathir(surah, ayah);
  }

  function getSourceLabel(source) {
    return source === 'muyassar' ? 'Tafsir Muyassar' : 'Tafsir Ibn Kathir';
  }

  return { getVerseTafsir, getSourceLabel };
})();
