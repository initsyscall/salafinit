const QuranApi = (() => {
  const BASE = 'https://api.alquran.cloud/v1';

  async function getSurah(surahNumber, edition = 'quran-uthmani') {
    return ApiClient.fetchApi(`${BASE}/surah/${surahNumber}/${edition}`);
  }

  async function getAyah(reference, edition = 'quran-uthmani') {
    return ApiClient.fetchApi(`${BASE}/ayah/${reference}/${edition}`);
  }

  async function getMultipleEditions(reference, editions) {
    const editionsStr = editions.join(',');
    return ApiClient.fetchApi(`${BASE}/ayah/${reference}/editions/${editionsStr}`);
  }

  async function getSurahWithTranslation(surahNumber, editions = ['quran-uthmani', 'en.hilali']) {
    const editionsStr = editions.join(',');
    return ApiClient.fetchApi(`${BASE}/surah/${surahNumber}/editions/${editionsStr}`);
  }

  async function getTafsir(surahNumber, edition = 'en-tafsir-ibn-kathir') {
    // Use English translation as tafsir (API returns Arabic text mixed with English)
    // TODO: Use quran.com API when authentication is sorted
    try {
      const translation = await ApiClient.fetchApi(`${BASE}/surah/${surahNumber}/en.hilali`);
      return translation;
    } catch (error) {
      console.error('Tafsir load error:', error);
      throw error;
    }
  }

  async function getAyahWithTafsir(reference, editions = ['quran-uthmani', 'en.hilali', 'en.ibn-kathir']) {
    const editionsStr = editions.join(',');
    return ApiClient.fetchApi(`${BASE}/ayah/${reference}/editions/${editionsStr}`);
  }

  async function getSurahList() {
    return ApiClient.fetchApi(`${BASE}/surah`);
  }

  async function search(keyword, page = 1, perPage = 20) {
    try {
      // Use alquran.cloud like the rest of the app - but it might not have search
      // Fallback to quran.com with translation filtering
      const alquranCloudSearch = await ApiClient.fetchApi(
        `${BASE}/search/${encodeURIComponent(keyword)}/en.hilali`,
        { cache: false }
      ).catch(() => null);

      // If alquran.cloud works, use it
      if (alquranCloudSearch?.data?.matches) {
        return {
          data: {
            matches: alquranCloudSearch.data.matches.length,
            matches: alquranCloudSearch.data.matches,
            total: alquranCloudSearch.data.matches.length,
            hasMore: false
          }
        };
      }

      // Fallback to quran.com
      const quranComBase = 'https://api.quran.com/api/v4';
      const response = await ApiClient.fetchApi(
        `${quranComBase}/search?query=${encodeURIComponent(keyword)}&language=en&page=${page}&per_page=${perPage}`,
        { cache: false }
      );

      const results = response?.search?.results || response?.results || [];
      const totalResults = response?.search?.total_results || response?.total_results || 0;

      if (results.length > 0) {
        const matches = results.map(result => {
          const verseKey = result.verse_key || '';
          const parts = verseKey.split(':');
          const surahNum = parseInt(parts[0]) || 1;
          const ayahNum = parseInt(parts[1]) || 1;

          const hilaliTrans = result.translations?.find(t => t.resource_id === 20);
          const translation = hilaliTrans?.text || result.translations?.[0]?.text || '';

          return {
            text: result.text || '',
            translation: translation,
            surah: { number: surahNum },
            numberInSurah: ayahNum
          };
        });
        return {
          data: {
            matches: matches.length,
            matches: matches,
            total: totalResults,
            currentPage: page,
            hasMore: (page * perPage) < totalResults
          }
        };
      }
return { data: { count: 0, matches: [], total: 0, currentPage: 1, hasMore: false } };
      } catch (error) {
        console.error('Search error:', error);
        return { data: { count: 0, matches: [], total: 0, currentPage: 1, hasMore: false } };
      }
  }

  return {
    getSurah,
    getAyah,
    getMultipleEditions,
    getSurahWithTranslation,
    getTafsir,
    getAyahWithTafsir,
    getSurahList,
    search
  };
})();
