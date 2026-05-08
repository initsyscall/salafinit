const HadithFetcher = (() => {
  const FWAZ_BASE = 'https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions';

  async function fetchFawazHadith(book, hadithNum) {
    const url = `${FWAZ_BASE}/${book.fawazId}/${hadithNum}.json`;
    try {
      const data = await ApiClient.fetchApi(url);
      if (!data || !data.hadiths || data.hadiths.length === 0) {
        return { notFound: true, isEndOfCollection: true, requestedNum: hadithNum, totalInCollection: book.totalHadiths };
      }
      
      const h = data.hadiths[0];
      const sectionNum = Object.keys(data.metadata.section || {})[0] || '1';
      const chapterName = data.metadata.section?.[sectionNum] || '';
      
      let arabicText = '';
      if (book.fawazArabicId) {
        try {
          const arabicUrl = `${FWAZ_BASE}/${book.fawazArabicId}/${hadithNum}.json`;
          const arabicData = await ApiClient.fetchApi(arabicUrl);
          if (arabicData && arabicData.hadiths && arabicData.hadiths.length > 0) {
            arabicText = arabicData.hadiths[0].text || '';
          }
        } catch (e) {
          console.warn(`Failed to fetch Arabic for ${book.id}#${hadithNum}:`, e.message);
        }
      }
      
      return {
        idInBook: h.hadithnumber,
        hadithnumber: h.hadithnumber,
        arabicnumber: h.arabicnumber,
        arabic: arabicText,
        english: {
          narrator: '',
          text: h.text || ''
        },
        grade: (h.grades && h.grades.length > 0) ? h.grades[0].grade : 'Sahih',
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
      return { notFound: true, isEndOfCollection: isHttpError && isAtOrBeyondEnd, requestedNum: hadithNum };
    }
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
    console.log(`[ITQAN] Fetching chapter ${chapter} for ${bookId}: ${url}`);
    try {
      const data = await ApiClient.fetchApi(url);
      if (Array.isArray(data)) {
        console.log(`[ITQAN] Chapter ${chapter} loaded ${data.length} hadiths`);
      }
      return data;
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
    console.log(`[ITQAN] Book ${bookId} total hadiths: ${totalFromIndex}, requested: ${hadithNum}`);
    
    if (hadithNum > totalFromIndex) {
        return { notFound: true, isEndOfCollection: true, requestedNum: hadithNum, totalInCollection: totalFromIndex };
    }
    
    let cumulative = 0;
    for (const chapter of chapters) {
        const count = chapter.count || 0;
        console.log(`[ITQAN] Checking chapter ${chapter.file} cumulative=${cumulative} count=${count} target=${hadithNum}`);
        if (hadithNum <= cumulative + count) {
            const chapterNum = parseInt(chapter.file.replace('.json', ''));
            console.log(`[ITQAN] Found hadith ${hadithNum} in chapter ${chapter.file}, local position: ${hadithNum - cumulative}`);
            const rawData = await getItqanChapterHadiths(collection, bookId, chapterNum);
            const hadiths = Array.isArray(rawData) ? rawData : (rawData?.hadiths || []);
            
            let hadith;
            if (collection === 'shia') {
                hadith = hadiths.find(h => parseInt(h.id) === parseInt(hadithNum)) || null;
            } else {
                const localPosition = hadithNum - cumulative;
                console.log(`[ITQAN] Searching for local position ${localPosition} in ${hadiths.length} hadiths`);
                hadith = hadiths.find(h => parseInt(h.id) === parseInt(hadithNum)) || null;
                if (!hadith) {
                    hadith = hadiths.find(h => {
                        const hId = h.idInBook || h.hadithnumber;
                        return parseInt(hId) === parseInt(localPosition);
                    }) || null;
                }
                if (!hadith) {
                    console.log(`[ITQAN] NOT FOUND! First 3 hadith IDs:`, hadiths.slice(0, 3).map(h => h.id || h.idInBook));
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