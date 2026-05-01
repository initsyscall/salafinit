const HadithApi = (() => {
  const BASE = 'https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1';

  const KUTUB_AL_SITTAH = [
    { id: 'bukhari', name: 'Sahih Bukhari', arabic: 'صحيح البخاري' },
    { id: 'muslim', name: 'Sahih Muslim', arabic: 'صحيح مسلم' },
    { id: 'tirmidhi', name: 'Jami At-Tirmidhi', arabic: 'جامع الترمذي' },
    { id: 'abudawud', name: 'Sunan Abu Dawud', arabic: 'سنن أبي داود' },
    { id: 'nasai', name: 'Sunan An-Nasai', arabic: 'سنن النسائي' },
    { id: 'ibnmajah', name: 'Sunan Ibn Majah', arabic: 'سنن ابن ماجه' }
  ];

  const ALL_BOOKS = [
    ...KUTUB_AL_SITTAH,
    { id: 'ahmad', name: 'Musnad Ahmad', arabic: 'مسند أحمد' },
    { id: 'malik', name: 'Muwatta Malik', arabic: 'موطأ مالك' },
    { id: 'darimi', name: 'Sunan Darimi', arabic: 'سنن الدارمي' },
    { id: 'nawawi', name: 'Riyad As-Salihin', arabic: 'رياض الصالحين' }
  ];

  function getAvailableBooks() {
    return ALL_BOOKS;
  }

  function getKutubAlSittah() {
    return KUTUB_AL_SITTAH;
  }

  async function getBookHadiths(bookId) {
    const url = `${BASE}/editions/${bookId}.json`;
    return ApiClient.fetchApi(url);
  }

  async function getHadith(bookId, hadithNumber) {
    const url = `${BASE}/editions/${bookId}/${hadithNumber}.json`;
    return ApiClient.fetchApi(url);
  }

  async function getEditions() {
    const url = `${BASE}/editions.json`;
    return ApiClient.fetchApi(url);
  }

  function normalizeGrading(grade) {
    if (!grade) return { type: 'unknown', color: 'var(--color-primary)', label: 'Unknown' };
    
    const gradeLower = grade.toLowerCase();
    
    if (gradeLower.includes('sahih') || gradeLower.includes('authentic') || gradeLower.includes('saheeh')) {
      return { type: 'sahih', color: '#80FFEA', label: grade };
    }
    if (gradeLower.includes('hasan') || gradeLower.includes('good')) {
      return { type: 'hasan', color: '#F6C177', label: grade };
    }
    if (gradeLower.includes('daif') || gradeLower.includes('dha') || gradeLower.includes('weak') || gradeLower.includes('daee')) {
      return { type: 'daif', color: '#FF3366', label: grade };
    }
    if (gradeLower.includes('mawdu') || gradeLower.includes('fabricated') || gradeLower.includes('made up')) {
      return { type: 'mawdu', color: '#FF3366', label: grade };
    }
    if (gradeLower.includes('munkar')) {
      return { type: 'munkar', color: '#A277FF', label: grade };
    }
    
    return { type: 'other', color: '#908CAA', label: grade };
  }

  function parseScholarGrades(gradesArray) {
    if (!gradesArray || !Array.isArray(gradesArray)) return [];
    
    return gradesArray.map(g => {
      const parts = g.split(':');
      if (parts.length >= 2) {
        return {
          scholar: parts[0].trim(),
          grade: parts.slice(1).join(':').trim()
        };
      }
      return null;
    }).filter(Boolean);
  }

  function processHadithData(data, bookName) {
    if (!data || !data.hadiths) return null;
    
    const hadiths = data.hadiths.map(h => {
      const mainGrade = h.grade || 'Unknown';
      const gradeInfo = normalizeGrading(mainGrade);
      const scholarGrades = parseScholarGrades(h.grades);
      
      return {
        hadithNumber: h.hadithNumber,
        text: h.text,
        grade: mainGrade,
        gradeInfo: gradeInfo,
        grades: scholarGrades,
        section: h.section
      };
    });
    
    return {
      book: data.book,
      name: data.name,
      collection: data.collection,
      hadiths: hadiths
    };
  }

  function getGradeClass(gradeType) {
    switch (gradeType) {
      case 'sahih': return 'grade-sahih';
      case 'hasan': return 'grade-hasan';
      case 'daif': return 'grade-daif';
      case 'mawdu': return 'grade-mawdu';
      case 'munkar': return 'grade-munkar';
      default: return 'grade-other';
    }
  }

  return {
    getAvailableBooks,
    getKutubAlSittah,
    getBookHadiths,
    getHadith,
    getEditions,
    normalizeGrading,
    parseScholarGrades,
    processHadithData,
    getGradeClass
  };
})();