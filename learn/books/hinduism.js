const HinduismBooks = (() => {
  const DHARMIC_BASE = 'https://raw.githubusercontent.com/bhavykhatri/DharmicData/main/';
  const DEVA_VEDA_BASE = 'https://raw.githubusercontent.com/indraai/deva.veda/main/data/';

  const BOOKS = [
    { id: 'bhagavad-gita', name: 'Bhagavad Gita', devanagari: 'भगवद्‌गीता', arabic: 'الْبَهَغَوَدْ غِيتَا', section: 'gita', chapters: 18, hasApi: true },
    { id: 'rigveda', name: 'Rigveda', devanagari: 'ऋग्वेद', arabic: 'الرِّغْفِيدَا', section: 'vedas', chapters: 10, hasApi: true },
    { id: 'yajurveda', name: 'Yajurveda', devanagari: 'यजुर्वेद', arabic: 'يَجُرْفِيدَا', section: 'vedas', chapters: 40, hasApi: true },
    { id: 'samaveda', name: 'Samaveda', devanagari: 'सामवेद', arabic: 'سَامَفِيدَا', section: 'vedas', chapters: 15, hasApi: true },
    { id: 'atharvaveda', name: 'Atharvaveda', devanagari: 'अथर्ववेद', arabic: 'أَثَرْفِيدَا', section: 'vedas', chapters: 20, hasApi: true },
    { id: 'ramayana', name: 'Ramayana', devanagari: 'रामायण', arabic: 'رَامَايَانَا', section: 'epics', chapters: 7, hasApi: true },
    { id: 'mahabharata', name: 'Mahabharata', devanagari: 'महाभारत', arabic: 'مَهَابَارَتَا', section: 'epics', chapters: 18, hasApi: true }
  ];

  function getAll() { return BOOKS; }
  function getById(id) { return BOOKS.find(b => b.id === id); }
  function getBySection(s) { return BOOKS.filter(b => b.section === s); }
  function getAvailable() { return BOOKS.filter(b => b.hasApi); }

  const SECTION_LABELS = {
    gita: { name: 'Bhagavad Gita', devanagari: 'भगवद्‌गीता', arabic: 'الْبَهَغَوَدْ غِيتَا' },
    vedas: { name: 'Vedas', devanagari: 'वेदाः', arabic: 'الْفِيدَا' },
    epics: { name: 'Itihasa (Epics)', devanagari: 'इतिहास', arabic: 'الْمَلَاحِمُ' }
  };

  function getBookConfig(book) {
    switch (book.id) {
      case 'rigveda':
        return { chapterLabel: 'Mandala', verseLabel: 'Hymn', type: 'mandala-files' };
      case 'yajurveda':
        return { chapterLabel: 'Adhyaya', verseLabel: 'Verse', type: 'single-file' };
      case 'samaveda':
        return { chapterLabel: 'Book', verseLabel: 'Decade', type: 'book-files' };
      case 'atharvaveda':
        return { chapterLabel: 'Kaanda', verseLabel: 'Hymn', type: 'kaanda-files' };
      case 'ramayana':
        return { chapterLabel: 'Kanda', verseLabel: 'Sarga', type: 'book-with-chapters' };
      case 'mahabharata':
        return { chapterLabel: 'Parva', verseLabel: 'Adhyaya', type: 'book-with-chapters' };
      default:
        return { chapterLabel: 'Chapter', verseLabel: 'Verse', type: 'gita-api' };
    }
  }

  async function fetchChapterData(bookId, chapterNum, subNum) {
    const book = getById(bookId);
    if (!book || !book.hasApi) return null;

    const ch = parseInt(chapterNum);
    if (isNaN(ch)) return null;

    try {
      switch (book.id) {
        case 'bhagavad-gita': {
          const url = `${DHARMIC_BASE}SrimadBhagvadGita/bhagavad_gita_chapter_${ch}.json`;
          const data = await ApiClient.fetchApi(url);
          const verses = data?.BhagavadGitaChapter || [];
          return verses.map(v => ({
            number: parseInt(v.verse),
            text: v.text,
            transliteration: null,
            meaning: v.translations?.['shri purohit swami'] || null
          }));
        }

        case 'rigveda': {
          const num = String(ch).padStart(2, '0');
          const url = `${DEVA_VEDA_BASE}rigveda/books/${num}.json`;
          const data = await ApiClient.fetchApi(url);
          const items = data?.data || [];
          return items.map((item, i) => ({
            number: i + 1,
            text: `${item.title}\n\n${item.content.replace(/p:/g, '').trim()}`
          }));
        }

        case 'yajurveda': {
          const url = `${DHARMIC_BASE}Yajurveda/vajasneyi_madhyadina_samhita.json`;
          const data = await ApiClient.fetchApi(url);
          const match = (data || []).find(item => parseInt(item.adhyaya) === ch);
          if (!match) return [];
          const text = match.text;
          const parts = text.split(/।।\s*\d+।।/).filter(Boolean);
          return parts.map((t, i) => ({
            number: i + 1,
            text: t.trim()
          }));
        }

        case 'samaveda': {
          const num = String(ch).padStart(2, '0');
          const url = `${DEVA_VEDA_BASE}samaveda/books/${num}.json`;
          const data = await ApiClient.fetchApi(url);
          const items = data?.data || [];
          return items.map(item => ({
            number: parseInt(item.key),
            text: `${item.title}\n\n${item.content.replace(/p:/g, '').trim()}`
          }));
        }

        case 'atharvaveda': {
          const num = String(ch).padStart(2, '0');
          const url = `${DEVA_VEDA_BASE}atharvaveda/books/${num}.json`;
          const data = await ApiClient.fetchApi(url);
          const items = data?.data || [];
          return items.map((item, i) => ({
            number: i + 1,
            text: `${item.title}\n\n${item.content}`.trim()
          }));
        }

        case 'ramayana': {
          const bookFiles = {
            1: '1_balakanda.json', 2: '2_ayodhyakanda.json', 3: '3_aranyakanda.json',
            4: '4_kishkindhakanda.json', 5: '5_sundarakanda.json', 6: '6_yudhhakanda.json',
            7: '7_uttarakanda.json'
          };
          const file = bookFiles[ch];
          if (!file) return [];
          const url = `${DHARMIC_BASE}ValmikiRamayana/${file}`;
          const data = await ApiClient.fetchApi(url);
          if (subNum) {
            const sarg = parseInt(subNum);
            const verses = (data || []).filter(item => parseInt(item.sarg) === sarg);
            return verses.map(item => ({
              number: parseInt(item.shloka),
              text: item.text,
              sarga: sarg
            }));
          }
          const sargas = {};
          (data || []).forEach(item => {
            const s = parseInt(item.sarg);
            if (!sargas[s]) sargas[s] = 0;
            sargas[s]++;
          });
          return Object.keys(sargas).map(Number).sort((a, b) => a - b).map(s => ({
            number: s,
            verseCount: sargas[s],
            isChapter: true
          }));
        }

        case 'mahabharata': {
          const url = `${DHARMIC_BASE}Mahabharata/mahabharata_book_${ch}.json`;
          const data = await ApiClient.fetchApi(url);
          if (!data) return [];
          if (subNum) {
            const adhyaya = parseInt(subNum);
            const verses = (data || []).filter(item => parseInt(item.chapter) === adhyaya);
            return verses.map(item => ({
              number: parseInt(item.shloka),
              text: item.text,
              chapter: adhyaya
            }));
          }
          const chapters = {};
          (data || []).forEach(item => {
            const a = parseInt(item.chapter);
            if (!chapters[a]) chapters[a] = 0;
            chapters[a]++;
          });
          return Object.keys(chapters).map(Number).sort((a, b) => a - b).map(a => ({
            number: a,
            verseCount: chapters[a],
            isChapter: true
          }));
        }

        default:
          return [];
      }
    } catch (e) {
      return null;
    }
  }

  return { getAll, getById, getBySection, getAvailable, SECTION_LABELS, fetchChapterData, getBookConfig };
})();

window.HinduismBooks = HinduismBooks;
