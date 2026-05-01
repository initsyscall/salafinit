const TafsirApi = (() => {
  async function getVerseTafsir(surah, ayah) {
    try {
      const res = await fetch(`https://api.quran.com/api/v4/tafsirs/169/by_ayah/${surah}:${ayah}`);
      if (!res.ok) {
        throw new Error('Tafsir not available for this verse.');
      }
      const data = await res.json();
      return { text: data.tafsir.text };
    } catch (error) {
      console.error('Tafsir API error:', error);
      throw error;
    }
  }

  return { getVerseTafsir };
})();
