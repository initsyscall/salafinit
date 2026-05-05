const HadithBooks = (() => {
  const SUNNI_BOOKS = [
    { id: 'bukhari', name: 'Sahih al-Bukhari', arabic: 'صحيح البخاري', type: 'gold', collection: 'sunni', totalHadiths: 7563, apiSource: 'fawaz', fawazId: 'eng-bukhari' },
    { id: 'muslim', name: 'Sahih Muslim', arabic: 'صحيح مسلم', type: 'gold', collection: 'sunni', totalHadiths: 7232, apiSource: 'fawaz', fawazId: 'eng-muslim' },
    { id: 'tirmidhi', name: "Jami' at-Tirmidhi", arabic: 'جامع الترمذي', type: 'kutub', collection: 'sunni', totalHadiths: 3956, apiSource: 'fawaz', fawazId: 'eng-tirmidhi' },
    { id: 'abudawud', name: 'Sunan Abu Dawud', arabic: 'سنن أبي داود', type: 'kutub', collection: 'sunni', totalHadiths: 5274, apiSource: 'fawaz', fawazId: 'eng-abudawud' },
    { id: 'nasai', name: 'Sunan an-Nasai', arabic: 'سنن النسائي', type: 'kutub', collection: 'sunni', totalHadiths: 5662, apiSource: 'fawaz', fawazId: 'eng-nasai' },
    { id: 'ibnmajah', name: 'Sunan Ibn Majah', arabic: 'سنن ابن ماجه', type: 'kutub', collection: 'sunni', totalHadiths: 4341, apiSource: 'fawaz', fawazId: 'eng-ibnmajah' },
    { id: 'malik', name: 'Muwatta Malik', arabic: 'موطأ مالك', type: 'mutawa', collection: 'sunni', totalHadiths: 1893, apiSource: 'itqan' },
    { id: 'darimi', name: 'Sunan al-Darimi', arabic: 'سنن الدارمي', type: 'primary', collection: 'sunni', totalHadiths: 2919, apiSource: 'itqan' },
    { id: 'ahmed', name: 'Musnad Ahmad', arabic: 'مسند أحمد', type: 'primary', collection: 'sunni', totalHadiths: 27097, apiSource: 'itqan' },
    { id: 'aladab_almufrad', name: 'Al-Adab Al-Mufrod', arabic: 'الأدب المفرد', type: 'primary', collection: 'sunni', totalHadiths: 1322, apiSource: 'itqan' },
    { id: 'bulugh_almaram', name: 'Bulugh al-Maram', arabic: 'بلوغ المرام', type: 'primary', collection: 'sunni', totalHadiths: 1563, apiSource: 'itqan' },
    { id: 'mishkat_almasabih', name: 'Mishkat al-Masabih', arabic: 'مشكاة المصابيح', type: 'primary', collection: 'sunni', totalHadiths: 6108, apiSource: 'itqan' },
    { id: 'musannaf_ibnabi_shaybah', name: "Musannaf Ibn Abi Shaybah", arabic: 'مصنف ابن أبي شيبة', type: 'primary', collection: 'sunni', totalHadiths: 37943, apiSource: 'itqan' },
    { id: 'nawawi40', name: "Nawawi's 40 Hadiths", arabic: 'الأربعون النووية', type: 'Forty', collection: 'sunni', totalHadiths: 42, apiSource: 'itqan' },
    { id: 'qudsi40', name: '40 Qudsi Hadiths', arabic: 'الأربعون القبلية', type: 'qudsi', collection: 'sunni', totalHadiths: 40, apiSource: 'itqan' },
    { id: 'riyad_assalihin', name: 'Riyad as-Salihin', arabic: 'رياض الصالحين', type: 'primary', collection: 'sunni', totalHadiths: 1918, apiSource: 'itqan' },
    { id: 'shahwaliullah40', name: "Shah Waliullah's 40", arabic: 'الأربعون الشاهوية', type: 'primary', collection: 'sunni', totalHadiths: 40, apiSource: 'itqan' }
  ];

  const SHIA_BOOKS = [
    { id: 'alkafi-1', name: 'Al-Kafi (Vol 1)', arabic: 'الكافي - الجزء الأول', type: 'kutub', collection: 'shia', totalHadiths: 3550 },
    { id: 'alkafi-2', name: 'Al-Kafi (Vol 2)', arabic: 'الكافي - الجزء الثاني', type: 'kutub', collection: 'shia', totalHadiths: 3550 },
    { id: 'alkafi-3', name: 'Al-Kafi (Vol 3)', arabic: 'الكافي - الجزء الثالث', type: 'kutub', collection: 'shia', totalHadiths: 3550 },
    { id: 'alkafi-4', name: 'Al-Kafi (Vol 4)', arabic: 'الكافي - الجزء الرابع', type: 'kutub', collection: 'shia', totalHadiths: 3550 },
    { id: 'alkafi-5', name: 'Al-Kafi (Vol 5)', arabic: 'الكافي - الجزء الخامس', type: 'kutub', collection: 'shia', totalHadiths: 3550 },
    { id: 'alkafi-6', name: 'Al-Kafi (Vol 6)', arabic: 'الكافي - الجزء السادس', type: 'kutub', collection: 'shia', totalHadiths: 3550 },
    { id: 'alkafi-7', name: 'Al-Kafi (Vol 7)', arabic: 'الكافي - الجزء السابع', type: 'kutub', collection: 'shia', totalHadiths: 3550 },
    { id: 'alkafi-8', name: 'Al-Kafi (Vol 8)', arabic: 'الكافي - الجزء الثامن', type: 'kutub', collection: 'shia', totalHadiths: 3550 },
    { id: 'al-amali-mufid', name: "Al-Amali (Mufid)", arabic: 'الأمالي (المفيد)', type: 'primary', collection: 'shia', totalHadiths: 784 },
    { id: 'al-amali-saduq', name: "Al-Amali (Saduq)", arabic: 'الأمالي (الصدوق)', type: 'primary', collection: 'shia', totalHadiths: 1500 },
    { id: 'al-khisal', name: 'Al-Khisal', arabic: 'الخصال', type: 'primary', collection: 'shia', totalHadiths: 630 },
    { id: 'al-tawhid', name: 'Al-Tawhid', arabic: 'التوحيد', type: 'primary', collection: 'shia', totalHadiths: 500 },
    { id: 'kitab-al-ghayba-numani', name: 'Kitab al-Ghayba (Numani)', arabic: 'كتاب الغيبة (النعماني)', type: 'primary', collection: 'shia', totalHadiths: 350 },
    { id: 'kitab-al-ghayba-tusi', name: 'Kitab al-Ghayba (Tusi)', arabic: 'كتاب الغيبة (الطوسي)', type: 'primary', collection: 'shia', totalHadiths: 600 },
    { id: 'maani-al-akhbar', name: "Ma'ani al-Akhbar", arabic: 'معاني الأخبار', type: 'primary', collection: 'shia', totalHadiths: 450 },
    { id: 'uyun-rida-1', name: "Uyun al-Rida (Vol 1)", arabic: 'عيون أخبار الرضا - الجزء الأول', type: 'primary', collection: 'shia', totalHadiths: 400 }
  ];

  function getSunni() { return SUNNI_BOOKS; }
  function getShia() { return SHIA_BOOKS; }
  function getAll() { return { sunni: SUNNI_BOOKS, shia: SHIA_BOOKS }; }
  function getById(id) {
    const all = [...SUNNI_BOOKS, ...SHIA_BOOKS];
    return all.find(b => b.id === id);
  }

  return { getSunni, getShia, getAll, getById };
})();