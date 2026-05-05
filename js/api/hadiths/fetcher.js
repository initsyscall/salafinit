const HadithFetcher = (() => {
  const FWAZ_BASE = 'https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions';

  async function fetchFawazHadith(book, hadithNum) {
    const url = `${FWAZ_BASE}/${book.fawazId}/${hadithNum}.json`;
    try {
      const data = await ApiClient.fetchApi(url);
      if (!data || !data.hadiths || data.hadiths.length === 0) {
        return null;
      }
      
      const h = data.hadiths[0];
      const sectionNum = Object.keys(data.metadata.section || {})[0] || '1';
      const chapterName = data.metadata.section?.[sectionNum] || '';
      
      return {
        idInBook: h.hadithnumber,
        hadithnumber: h.hadithnumber,
        arabicnumber: h.arabicnumber,
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
      return null;
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
    
    let cumulative = 0;
    for (const chapter of chapters) {
      const count = chapter.count || 0;
      if (hadithNum <= cumulative + count) {
        const chapterNum = parseInt(chapter.file.replace('.json', ''));
        const rawData = await getItqanChapterHadiths(collection, bookId, chapterNum);
        const hadiths = Array.isArray(rawData) ? rawData : (rawData?.hadiths || []);
        
        // Search by actual hadith number (not local position in chapter)
        let hadith = hadiths.find(h => {
          const hId = h.idInBook || h.id || h.hadithnumber;
          return parseInt(hId) === parseInt(hadithNum);
        }) || null;
        
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
    
    return null;
  }

  async function findHadithByNumber(collection, bookId, hadithNum) {
    const book = HadithBooks.getById(bookId);
    
    if (book && book.apiSource === 'fawaz') {
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