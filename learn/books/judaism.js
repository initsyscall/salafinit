const JudaismBooks = (() => {
  const BOOKS = [
    { id: 'genesis', name: 'Genesis', hebrew: 'בְּרֵאשִׁית', arabic: 'سِفْرُ التَّكْوِينِ', section: 'torah', chapters: 50 },
    { id: 'exodus', name: 'Exodus', hebrew: 'שְׁמוֹת', arabic: 'سِفْرُ الْخُرُوجِ', section: 'torah', chapters: 40 },
    { id: 'leviticus', name: 'Leviticus', hebrew: 'וַיִּקְרָא', arabic: 'سِفْرُ اللَّاوِيِّينَ', section: 'torah', chapters: 27 },
    { id: 'numbers', name: 'Numbers', hebrew: 'בְּמִדְבַּר', arabic: 'سِفْرُ الْعَدَدِ', section: 'torah', chapters: 36 },
    { id: 'deuteronomy', name: 'Deuteronomy', hebrew: 'דְּבָרִים', arabic: 'سِفْرُ التَّثْنِيَةِ', section: 'torah', chapters: 34 },
    { id: 'joshua', name: 'Joshua', hebrew: 'יְהוֹשֻׁעַ', arabic: 'سِفْرُ يَشُوعَ', section: 'neviim', chapters: 24 },
    { id: 'judges', name: 'Judges', hebrew: 'שׁוֹפְטִים', arabic: 'سِفْرُ الْقُضَاةِ', section: 'neviim', chapters: 21 },
    { id: '1-samuel', name: 'I Samuel', hebrew: 'שְׁמוּאֵל א׳', arabic: 'سِفْرُ صَمُوئِيلَ الْأَوَّلُ', section: 'neviim', chapters: 31 },
    { id: '2-samuel', name: 'II Samuel', hebrew: 'שְׁמוּאֵל ב׳', arabic: 'سِفْرُ صَمُوئِيلَ الثَّانِي', section: 'neviim', chapters: 24 },
    { id: '1-kings', name: 'I Kings', hebrew: 'מְלָכִים א׳', arabic: 'سِفْرُ الْمُلُوكِ الْأَوَّلُ', section: 'neviim', chapters: 22 },
    { id: '2-kings', name: 'II Kings', hebrew: 'מְלָכִים ב׳', arabic: 'سِفْرُ الْمُلُوكِ الثَّانِي', section: 'neviim', chapters: 25 },
    { id: 'isaiah', name: 'Isaiah', hebrew: 'יְשַׁעְיָהוּ', arabic: 'سِفْرُ إِشَعْيَاءَ', section: 'neviim', chapters: 66 },
    { id: 'jeremiah', name: 'Jeremiah', hebrew: 'יִרְמְיָהוּ', arabic: 'سِفْرُ إِرْمِيَا', section: 'neviim', chapters: 52 },
    { id: 'ezekiel', name: 'Ezekiel', hebrew: 'יְחֶזְקֵאל', arabic: 'سِفْرُ حِزْقِيَالَ', section: 'neviim', chapters: 48 },
    { id: 'hosea', name: 'Hosea', hebrew: 'הוֹשֵׁעַ', arabic: 'سِفْرُ هُوشَعَ', section: 'neviim', chapters: 14 },
    { id: 'joel', name: 'Joel', hebrew: 'יוֹאֵל', arabic: 'سِفْرُ يُوئِيلَ', section: 'neviim', chapters: 3 },
    { id: 'amos', name: 'Amos', hebrew: 'עָמוֹס', arabic: 'سِفْرُ عَامُوسَ', section: 'neviim', chapters: 9 },
    { id: 'obadiah', name: 'Obadiah', hebrew: 'עוֹבַדְיָה', arabic: 'سِفْرُ عُوبَدْيَا', section: 'neviim', chapters: 1 },
    { id: 'jonah', name: 'Jonah', hebrew: 'יוֹנָה', arabic: 'سِفْرُ يُونَانَ', section: 'neviim', chapters: 4 },
    { id: 'micah', name: 'Micah', hebrew: 'מִיכָה', arabic: 'سِفْرُ مِيخَا', section: 'neviim', chapters: 7 },
    { id: 'nahum', name: 'Nahum', hebrew: 'נַחוּם', arabic: 'سِفْرُ نَاحُومَ', section: 'neviim', chapters: 3 },
    { id: 'habakkuk', name: 'Habakkuk', hebrew: 'חֲבַקּוּק', arabic: 'سِفْرُ حَبَقُوقَ', section: 'neviim', chapters: 3 },
    { id: 'zephaniah', name: 'Zephaniah', hebrew: 'צְפַנְיָה', arabic: 'سِفْرُ صَفَنْيَا', section: 'neviim', chapters: 3 },
    { id: 'haggai', name: 'Haggai', hebrew: 'חַגַּי', arabic: 'سِفْرُ حَجَّي', section: 'neviim', chapters: 2 },
    { id: 'zechariah', name: 'Zechariah', hebrew: 'זְכַרְיָה', arabic: 'سِفْرُ زَكَرِيَّا', section: 'neviim', chapters: 14 },
    { id: 'malachi', name: 'Malachi', hebrew: 'מַלְאָכִי', arabic: 'سِفْرُ مَلَاخِي', section: 'neviim', chapters: 4 },
    { id: 'psalms', name: 'Psalms', hebrew: 'תְּהִלִּים', arabic: 'سِفْرُ الْمَزَامِيرِ', section: 'ketuvim', chapters: 150 },
    { id: 'proverbs', name: 'Proverbs', hebrew: 'מִשְׁלֵי', arabic: 'سِفْرُ الْأَمْثَالِ', section: 'ketuvim', chapters: 31 },
    { id: 'job', name: 'Job', hebrew: 'אִיּוֹב', arabic: 'سِفْرُ أَيُّوبَ', section: 'ketuvim', chapters: 42 },
    { id: 'song-of-solomon', name: 'Song of Songs', hebrew: 'שִׁיר הַשִּׁירִים', arabic: 'سِفْرُ نَشِيدِ الْأَنْشَادِ', section: 'ketuvim', chapters: 8 },
    { id: 'ruth', name: 'Ruth', hebrew: 'רוּת', arabic: 'سِفْرُ رَاعُوثَ', section: 'ketuvim', chapters: 4 },
    { id: 'lamentations', name: 'Lamentations', hebrew: 'אֵיכָה', arabic: 'سِفْرُ الْمَرَاثِي', section: 'ketuvim', chapters: 5 },
    { id: 'ecclesiastes', name: 'Ecclesiastes', hebrew: 'קֹהֶלֶת', arabic: 'سِفْرُ الْجَامِعَةِ', section: 'ketuvim', chapters: 12 },
    { id: 'esther', name: 'Esther', hebrew: 'אֶסְתֵּר', arabic: 'سِفْرُ أَسْتِيرَ', section: 'ketuvim', chapters: 10 },
    { id: 'daniel', name: 'Daniel', hebrew: 'דָּנִיֵּאל', arabic: 'سِفْرُ دَانِيَالَ', section: 'ketuvim', chapters: 12 },
    { id: 'ezra', name: 'Ezra', hebrew: 'עֶזְרָא', arabic: 'سِفْرُ عَزْرَا', section: 'ketuvim', chapters: 10 },
    { id: 'nehemiah', name: 'Nehemiah', hebrew: 'נְחֶמְיָה', arabic: 'سِفْرُ نَحَمْيَا', section: 'ketuvim', chapters: 13 },
    { id: '1-chronicles', name: 'I Chronicles', hebrew: 'דִּבְרֵי הַיָּמִים א׳', arabic: 'سِفْرُ أَخْبَارِ الْأَيَّامِ الْأَوَّلُ', section: 'ketuvim', chapters: 29 },
    { id: '2-chronicles', name: 'II Chronicles', hebrew: 'דִּבְרֵי הַיָּמִים ב׳', arabic: 'سِفْرُ أَخْبَارِ الْأَيَّامِ الثَّانِي', section: 'ketuvim', chapters: 36 }
  ];

  function getAll() { return BOOKS; }
  function getById(id) { return BOOKS.find(b => b.id === id); }
  function getBySection(s) { return BOOKS.filter(b => b.section === s); }
  function getTorah() { return getBySection('torah'); }
  function getNeviim() { return getBySection('neviim'); }
  function getKetuvim() { return getBySection('ketuvim'); }

  const SECTION_LABELS = {
    torah: { name: 'Torah', hebrew: 'תּוֹרָה', arabic: 'التَّوْرَاةُ' },
    neviim: { name: 'Nevi\'im', hebrew: 'נְבִיאִים', arabic: 'الْأَنْبِيَاءُ' },
    ketuvim: { name: 'Ketuvim', hebrew: 'כְּתוּבִים', arabic: 'الْكُتُبُ' }
  };

  return { getAll, getById, getTorah, getNeviim, getKetuvim, getBySection, SECTION_LABELS };
})();

window.JudaismBooks = JudaismBooks;
