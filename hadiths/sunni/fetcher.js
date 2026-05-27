const HadithFetcher = (() => {
  const FWAZ_BASE = 'https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@latest/editions';
  const prefetchCache = new Map();

  async function fetchFawazHadith(book, hadithNum) {
    const url = `${FWAZ_BASE}/${book.fawazId}/${hadithNum}.json`;

    try {
      const [data, arabicData] = await Promise.all([
        ApiClient.fetchApi(url),
        book.fawazArabicId ? ApiClient.fetchApi(`${FWAZ_BASE}/${book.fawazArabicId}/${hadithNum}.json`).catch(() => null) : Promise.resolve(null)
      ]);

      if (!data || !data.hadiths || data.hadiths.length === 0) {
        return { notFound: true, isEndOfCollection: true, requestedNum: hadithNum, totalInCollection: book.totalHadiths };
      }

      const h = data.hadiths[0];
      const sectionNum = Object.keys(data.metadata?.section || {})[0] || '1';
      const chapterName = data.metadata?.section?.[sectionNum] || '';

      const arabicText = (arabicData?.hadiths?.[0]?.text) || '';

      prefetchNextHadith(book, hadithNum);

      const grades = h.grades || [];
      return {
        idInBook: h.hadithnumber,
        hadithnumber: h.hadithnumber,
        arabicnumber: h.arabicnumber,
        arabic: arabicText,
        english: {
          narrator: '',
          text: h.text || ''
        },
        grade: grades.length > 0 ? grades[0].grade : 'Sahih',
        allGrades: grades,
        chapter: {
          number: parseInt(sectionNum),
          name_en: chapterName,
          name_ar: ''
        },
        reference: h.reference,
        isFawaz: true
      };
    } catch (e) {
      console.error(`Failed to fetch fawaz hadith ${book.id}#${hadithNum}:`, e.message);
      const isHttpError = e.message.includes('403') || e.message.includes('404');
      const isAtOrBeyondEnd = hadithNum >= (book.totalHadiths || 0);
      return { notFound: true, isEndOfCollection: isHttpError && isAtOrBeyondEnd, requestedNum: hadithNum, totalInCollection: book?.totalHadiths || 0 };
    }
  }

  function prefetchNextHadith(book, currentNum) {
    if (currentNum >= (book.totalHadiths || 0)) return;
    const nextNum = currentNum + 1;
    const cacheKey = `${book.fawazId}-${nextNum}`;
    if (prefetchCache.has(cacheKey)) return;

    const url = `${FWAZ_BASE}/${book.fawazId}/${nextNum}.json`;
    ApiClient.fetchApi(url, { cache: true }).then(data => {
      if (data?.hadiths?.length > 0) {
        prefetchCache.set(cacheKey, data);
        if (book.fawazArabicId) {
          ApiClient.fetchApi(`${FWAZ_BASE}/${book.fawazArabicId}/${nextNum}.json`, { cache: true });
        }
      }
    }).catch(() => {});
  }

  async function getItqanChapterIndex(collection, bookId) {
    const baseUrl = HadithConfig.getBaseUrl(collection);
    const url = `${baseUrl}/${bookId}/index.json`;
    try {
      return await ApiClient.fetchApi(url);
    } catch (e) {
      console.error(`Failed to fetch index for ${bookId}:`, e.message);
      return null;
    }
  }

  async function getItqanChapterHadiths(collection, bookId, chapter) {
    const baseUrl = HadithConfig.getBaseUrl(collection);
    const url = `${baseUrl}/${bookId}/${chapter}.json`;
    try {
      return await ApiClient.fetchApi(url);
    } catch (e) {
      console.error(`Failed to fetch chapter ${chapter} for ${bookId}:`, e.message);
      return [];
    }
  }

async function findItqanHadith(collection, bookId, hadithNum) {
    const chapters = await getItqanChapterIndex(collection, bookId);
    
    if (!chapters || !Array.isArray(chapters)) {
        console.error(`No chapter index found for ${bookId}`);
        return null;
    }
    
    const totalFromIndex = chapters.reduce((sum, ch) => sum + (ch.count || 0), 0);
    
    if (hadithNum > totalFromIndex) {
        return { notFound: true, isEndOfCollection: true, requestedNum: hadithNum, totalInCollection: totalFromIndex };
    }
    
    let cumulative = 0;
    for (const chapter of chapters) {
        const count = chapter.count || 0;
        if (hadithNum <= cumulative + count) {
            const chapterNum = parseInt(chapter.file.replace('.json', ''));
            const rawData = await getItqanChapterHadiths(collection, bookId, chapterNum);
            const hadiths = Array.isArray(rawData) ? rawData : (rawData?.hadiths || []);
            
            let hadith;
            if (collection === 'shia') {
                hadith = hadiths.find(h => parseInt(h.id) === parseInt(hadithNum)) || null;
            } else {
                const localPosition = hadithNum - cumulative;
                hadith = hadiths.find(h => parseInt(h.id) === parseInt(hadithNum)) || null;
                if (!hadith) {
                    hadith = hadiths.find(h => {
                        const hId = h.idInBook || h.hadithnumber;
                        return parseInt(hId) === parseInt(localPosition);
                    }) || null;
                }
            }
            
            if (hadith) {
                if (collection === 'shia' && hadith.chapter) {
                    hadith.chapter = {
                        number: chapterNum,
                        name_en: hadith.chapter || '',
                        name_ar: ''
                    };
                } else {
                    hadith.chapter = {
                        number: chapterNum,
                        name_en: chapter.name_en || '',
                        name_ar: chapter.name_ar || ''
                    };
                }
            }
            
            return hadith;
        }
        cumulative += count;
    }
    
    return { notFound: true, isEndOfCollection: true, requestedNum: hadithNum, totalInCollection: totalFromIndex };
}

  async function findHadithByNumber(collection, bookId, hadithNum) {
    const book = HadithBooks.getById(bookId);
    
    if (book && book.apiSource === 'fawaz') {
      if (book.totalHadiths && hadithNum > book.totalHadiths) {
        return { notFound: true, isEndOfCollection: true, requestedNum: hadithNum, totalInCollection: book.totalHadiths };
      }
      return await fetchFawazHadith(book, hadithNum);
    }
    
    return await findItqanHadith(collection, bookId, hadithNum);
  }

  async function getBookChapters(collection, bookId) {
    const book = HadithBooks.getById(bookId);
    
    if (book && book.apiSource === 'fawaz') {
      return { isFawaz: true, fawazId: book.fawazId };
    }
    
    return await getItqanChapterIndex(collection, bookId);
  }

  return { getBookChapters, findHadithByNumber };
})();