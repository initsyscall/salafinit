const BibleBooks = (() => {
  const BOOKS = [
    { id: 'genesis', name: 'Genesis', arabic: 'سِفْرُ التَّكْوِينِ', testament: 'ot', chapters: 50 },
    { id: 'exodus', name: 'Exodus', arabic: 'سِفْرُ الْخُرُوجِ', testament: 'ot', chapters: 40 },
    { id: 'leviticus', name: 'Leviticus', arabic: 'سِفْرُ اللَّاوِيِّينَ', testament: 'ot', chapters: 27 },
    { id: 'numbers', name: 'Numbers', arabic: 'سِفْرُ الْعَدَدِ', testament: 'ot', chapters: 36 },
    { id: 'deuteronomy', name: 'Deuteronomy', arabic: 'سِفْرُ التَّثْنِيَةِ', testament: 'ot', chapters: 34 },
    { id: 'joshua', name: 'Joshua', arabic: 'سِفْرُ يَشُوعَ', testament: 'ot', chapters: 24 },
    { id: 'judges', name: 'Judges', arabic: 'سِفْرُ الْقُضَاةِ', testament: 'ot', chapters: 21 },
    { id: 'ruth', name: 'Ruth', arabic: 'سِفْرُ رَاعُوثَ', testament: 'ot', chapters: 4 },
    { id: '1-samuel', name: '1 Samuel', arabic: 'سِفْرُ صَمُوئِيلَ الْأَوَّلُ', testament: 'ot', chapters: 31 },
    { id: '2-samuel', name: '2 Samuel', arabic: 'سِفْرُ صَمُوئِيلَ الثَّانِي', testament: 'ot', chapters: 24 },
    { id: '1-kings', name: '1 Kings', arabic: 'سِفْرُ الْمُلُوكِ الْأَوَّلُ', testament: 'ot', chapters: 22 },
    { id: '2-kings', name: '2 Kings', arabic: 'سِفْرُ الْمُلُوكِ الثَّانِي', testament: 'ot', chapters: 25 },
    { id: '1-chronicles', name: '1 Chronicles', arabic: 'سِفْرُ أَخْبَارِ الْأَيَّامِ الْأَوَّلُ', testament: 'ot', chapters: 29 },
    { id: '2-chronicles', name: '2 Chronicles', arabic: 'سِفْرُ أَخْبَارِ الْأَيَّامِ الثَّانِي', testament: 'ot', chapters: 36 },
    { id: 'ezra', name: 'Ezra', arabic: 'سِفْرُ عَزْرَا', testament: 'ot', chapters: 10 },
    { id: 'nehemiah', name: 'Nehemiah', arabic: 'سِفْرُ نَحَمْيَا', testament: 'ot', chapters: 13 },
    { id: 'esther', name: 'Esther', arabic: 'سِفْرُ أَسْتِيرَ', testament: 'ot', chapters: 10 },
    { id: 'job', name: 'Job', arabic: 'سِفْرُ أَيُّوبَ', testament: 'ot', chapters: 42 },
    { id: 'psalms', name: 'Psalms', arabic: 'سِفْرُ الْمَزَامِيرِ', testament: 'ot', chapters: 150 },
    { id: 'proverbs', name: 'Proverbs', arabic: 'سِفْرُ الْأَمْثَالِ', testament: 'ot', chapters: 31 },
    { id: 'ecclesiastes', name: 'Ecclesiastes', arabic: 'سِفْرُ الْجَامِعَةِ', testament: 'ot', chapters: 12 },
    { id: 'song-of-solomon', name: 'Song of Solomon', arabic: 'سِفْرُ نَشِيدِ الْأَنْشَادِ', testament: 'ot', chapters: 8 },
    { id: 'isaiah', name: 'Isaiah', arabic: 'سِفْرُ إِشَعْيَاءَ', testament: 'ot', chapters: 66 },
    { id: 'jeremiah', name: 'Jeremiah', arabic: 'سِفْرُ إِرْمِيَا', testament: 'ot', chapters: 52 },
    { id: 'lamentations', name: 'Lamentations', arabic: 'سِفْرُ الْمَرَاثِي', testament: 'ot', chapters: 5 },
    { id: 'ezekiel', name: 'Ezekiel', arabic: 'سِفْرُ حِزْقِيَالَ', testament: 'ot', chapters: 48 },
    { id: 'daniel', name: 'Daniel', arabic: 'سِفْرُ دَانِيَالَ', testament: 'ot', chapters: 12 },
    { id: 'hosea', name: 'Hosea', arabic: 'سِفْرُ هُوشَعَ', testament: 'ot', chapters: 14 },
    { id: 'joel', name: 'Joel', arabic: 'سِفْرُ يُوئِيلَ', testament: 'ot', chapters: 3 },
    { id: 'amos', name: 'Amos', arabic: 'سِفْرُ عَامُوسَ', testament: 'ot', chapters: 9 },
    { id: 'obadiah', name: 'Obadiah', arabic: 'سِفْرُ عُوبَدْيَا', testament: 'ot', chapters: 1 },
    { id: 'jonah', name: 'Jonah', arabic: 'سِفْرُ يُونَانَ', testament: 'ot', chapters: 4 },
    { id: 'micah', name: 'Micah', arabic: 'سِفْرُ مِيخَا', testament: 'ot', chapters: 7 },
    { id: 'nahum', name: 'Nahum', arabic: 'سِفْرُ نَاحُومَ', testament: 'ot', chapters: 3 },
    { id: 'habakkuk', name: 'Habakkuk', arabic: 'سِفْرُ حَبَقُوقَ', testament: 'ot', chapters: 3 },
    { id: 'zephaniah', name: 'Zephaniah', arabic: 'سِفْرُ صَفَنْيَا', testament: 'ot', chapters: 3 },
    { id: 'haggai', name: 'Haggai', arabic: 'سِفْرُ حَجَّي', testament: 'ot', chapters: 2 },
    { id: 'zechariah', name: 'Zechariah', arabic: 'سِفْرُ زَكَرِيَّا', testament: 'ot', chapters: 14 },
    { id: 'malachi', name: 'Malachi', arabic: 'سِفْرُ مَلَاخِي', testament: 'ot', chapters: 4 },
    { id: 'matthew', name: 'Matthew', arabic: 'إِنْجِيلُ مَتَّى', testament: 'nt', chapters: 28 },
    { id: 'mark', name: 'Mark', arabic: 'إِنْجِيلُ مَرْقُسَ', testament: 'nt', chapters: 16 },
    { id: 'luke', name: 'Luke', arabic: 'إِنْجِيلُ لُوقَا', testament: 'nt', chapters: 24 },
    { id: 'john', name: 'John', arabic: 'إِنْجِيلُ يُوحَنَّا', testament: 'nt', chapters: 21 },
    { id: 'acts', name: 'Acts', arabic: 'سِفْرُ أَعْمَالِ الرُّسُلِ', testament: 'nt', chapters: 28 },
    { id: 'romans', name: 'Romans', arabic: 'رِسَالَةُ رُومَا', testament: 'nt', chapters: 16 },
    { id: '1-corinthians', name: '1 Corinthians', arabic: 'رِسَالَةُ كُورِنْثُوسَ الْأُولَى', testament: 'nt', chapters: 16 },
    { id: '2-corinthians', name: '2 Corinthians', arabic: 'رِسَالَةُ كُورِنْثُوسَ الثَّانِيَة', testament: 'nt', chapters: 13 },
    { id: 'galatians', name: 'Galatians', arabic: 'رِسَالَةُ غَلَاطِيَّة', testament: 'nt', chapters: 6 },
    { id: 'ephesians', name: 'Ephesians', arabic: 'رِسَالَةُ أَفَسُسَ', testament: 'nt', chapters: 6 },
    { id: 'philippians', name: 'Philippians', arabic: 'رِسَالَةُ فِيلِبِّي', testament: 'nt', chapters: 4 },
    { id: 'colossians', name: 'Colossians', arabic: 'رِسَالَةُ كُولُوسِّي', testament: 'nt', chapters: 4 },
    { id: '1-thessalonians', name: '1 Thessalonians', arabic: 'رِسَالَةُ تَسَالُونِيكِي الْأُولَى', testament: 'nt', chapters: 5 },
    { id: '2-thessalonians', name: '2 Thessalonians', arabic: 'رِسَالَةُ تَسَالُونِيكِي الثَّانِيَة', testament: 'nt', chapters: 3 },
    { id: '1-timothy', name: '1 Timothy', arabic: 'رِسَالَةُ تِيمُوثَاوُسَ الْأُولَى', testament: 'nt', chapters: 6 },
    { id: '2-timothy', name: '2 Timothy', arabic: 'رِسَالَةُ تِيمُوثَاوُسَ الثَّانِيَة', testament: 'nt', chapters: 4 },
    { id: 'titus', name: 'Titus', arabic: 'رِسَالَةُ تِيطُسَ', testament: 'nt', chapters: 3 },
    { id: 'philemon', name: 'Philemon', arabic: 'رِسَالَةُ فِلِيمُونَ', testament: 'nt', chapters: 1 },
    { id: 'hebrews', name: 'Hebrews', arabic: 'رِسَالَةُ الْعِبْرَانِيِّينَ', testament: 'nt', chapters: 13 },
    { id: 'james', name: 'James', arabic: 'رِسَالَةُ يَعْقُوبَ', testament: 'nt', chapters: 5 },
    { id: '1-peter', name: '1 Peter', arabic: 'رِسَالَةُ بُطْرُسَ الْأُولَى', testament: 'nt', chapters: 5 },
    { id: '2-peter', name: '2 Peter', arabic: 'رِسَالَةُ بُطْرُسَ الثَّانِيَة', testament: 'nt', chapters: 3 },
    { id: '1-john', name: '1 John', arabic: 'رِسَالَةُ يُوحَنَّا الْأُولَى', testament: 'nt', chapters: 5 },
    { id: '2-john', name: '2 John', arabic: 'رِسَالَةُ يُوحَنَّا الثَّانِيَة', testament: 'nt', chapters: 1 },
    { id: '3-john', name: '3 John', arabic: 'رِسَالَةُ يُوحَنَّا الثَّالِثَة', testament: 'nt', chapters: 1 },
    { id: 'jude', name: 'Jude', arabic: 'رِسَالَةُ يَهُوذَا', testament: 'nt', chapters: 1 },
    { id: 'revelation', name: 'Revelation', arabic: 'سِفْرُ رُؤْيَا يُوحَنَّا', testament: 'nt', chapters: 22 }
  ];

  function getAll() { return BOOKS; }
  function getById(id) { return BOOKS.find(b => b.id === id); }
  function getByTestament(t) { return BOOKS.filter(b => b.testament === t); }
  function getOT() { return getByTestament('ot'); }
  function getNT() { return getByTestament('nt'); }
  function toApiName(book) {
    return book.name.toLowerCase().replace(/\s+/g, '+');
  }

  return { getAll, getById, getOT, getNT, toApiName };
})();

window.BibleBooks = BibleBooks;
