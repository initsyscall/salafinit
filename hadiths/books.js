const HadithBooks = (() => {
  const SUNNI_BOOKS = [
    { id: 'bukhari', name: 'Sahih al-Bukhari', arabic: 'صحيح البخاري', type: 'gold', collection: 'sunni', totalHadiths: 7563, apiSource: 'fawaz', fawazId: 'eng-bukhari', fawazArabicId: 'ara-bukhari' },
    { id: 'muslim', name: 'Sahih Muslim', arabic: 'صحيح مسلم', type: 'gold', collection: 'sunni', totalHadiths: 7563, apiSource: 'fawaz', fawazId: 'eng-muslim', fawazArabicId: 'ara-muslim' },
    { id: 'tirmidhi', name: "Jami' at-Tirmidhi", arabic: 'جامع الترمذي', type: 'kutub', collection: 'sunni', totalHadiths: 3956, apiSource: 'fawaz', fawazId: 'eng-tirmidhi', fawazArabicId: 'ara-tirmidhi' },
    { id: 'abudawud', name: 'Sunan Abu Dawud', arabic: 'سنن أبي داود', type: 'kutub', collection: 'sunni', totalHadiths: 5274, apiSource: 'fawaz', fawazId: 'eng-abudawud', fawazArabicId: 'ara-abudawud' },
    { id: 'nasai', name: 'Sunan an-Nasai', arabic: 'سنن النسائي', type: 'kutub', collection: 'sunni', totalHadiths: 5758, apiSource: 'fawaz', fawazId: 'eng-nasai', fawazArabicId: 'ara-nasai' },
    { id: 'ibnmajah', name: 'Sunan Ibn Majah', arabic: 'سنن ابن ماجه', type: 'kutub', collection: 'sunni', totalHadiths: 4341, apiSource: 'fawaz', fawazId: 'eng-ibnmajah', fawazArabicId: 'ara-ibnmajah' },
    { id: 'malik', name: 'Muwatta Malik', arabic: 'موطأ مالك', type: 'mutawa', collection: 'sunni', totalHadiths: 1985, apiSource: 'itqan' },
    { id: 'darimi', name: 'Sunan al-Darimi', arabic: 'سنن الدارمي', type: 'primary', collection: 'sunni', totalHadiths: 2757, apiSource: 'itqan' },
    { id: 'ahmed', name: 'Musnad Ahmad', arabic: 'مسند أحمد', type: 'primary', collection: 'sunni', totalHadiths: 26539, apiSource: 'itqan' },
    { id: 'aladab_almufrad', name: 'Al-Adab Al-Mufrod', arabic: 'الأدب المفرد', type: 'primary', collection: 'sunni', totalHadiths: 1326, apiSource: 'itqan' },
    { id: 'bulugh_almaram', name: 'Bulugh al-Maram', arabic: 'بلوغ المرام', type: 'primary', collection: 'sunni', totalHadiths: 1767, apiSource: 'itqan' },
    { id: 'mishkat_almasabih', name: 'Mishkat al-Masabih', arabic: 'مشكاة المصابيح', type: 'primary', collection: 'sunni', totalHadiths: 4427, apiSource: 'itqan' },
    { id: 'musannaf_ibnabi_shaybah', name: "Musannaf Ibn Abi Shaybah", arabic: 'مصنف ابن أبي شيبة', type: 'primary', collection: 'sunni', totalHadiths: 37943, apiSource: 'itqan' },
    { id: 'nawawi40', name: "Nawawi's 40 Hadiths", arabic: 'الأربعون النووية', type: 'Forty', collection: 'sunni', totalHadiths: 42, apiSource: 'itqan' },
    { id: 'qudsi40', name: '40 Qudsi Hadiths', arabic: 'الأربعون القبلية', type: 'qudsi', collection: 'sunni', totalHadiths: 40, apiSource: 'itqan' },
    { id: 'riyad_assalihin', name: 'Riyad as-Salihin', arabic: 'رياض الصالحين', type: 'primary', collection: 'sunni', totalHadiths: 1217, apiSource: 'itqan' },
    { id: 'shahwaliullah40', name: "Shah Waliullah's 40", arabic: 'الأربعون الشاهوية', type: 'primary', collection: 'sunni', totalHadiths: 40, apiSource: 'itqan' }
  ];

  const SHIA_BOOKS = [
    { id: 'alkafi-1', name: 'Al-Kafi (Vol 1)', arabic: 'الكافي - الجزء الأول', type: 'kutub', collection: 'shia', totalHadiths: 1445 },
    { id: 'alkafi-2', name: 'Al-Kafi (Vol 2)', arabic: 'الكافي - الجزء الثاني', type: 'kutub', collection: 'shia', totalHadiths: 2342 },
    { id: 'alkafi-3', name: 'Al-Kafi (Vol 3)', arabic: 'الكافي - الجزء الثالث', type: 'kutub', collection: 'shia', totalHadiths: 2178 },
    { id: 'alkafi-4', name: 'Al-Kafi (Vol 4)', arabic: 'الكافي - الجزء الرابع', type: 'kutub', collection: 'shia', totalHadiths: 2190 },
    { id: 'alkafi-5', name: 'Al-Kafi (Vol 5)', arabic: 'الكافي - الجزء الخامس', type: 'kutub', collection: 'shia', totalHadiths: 2088 },
    { id: 'alkafi-6', name: 'Al-Kafi (Vol 6)', arabic: 'الكافي - الجزء السادس', type: 'kutub', collection: 'shia', totalHadiths: 2510 },
    { id: 'alkafi-7', name: 'Al-Kafi (Vol 7)', arabic: 'الكافي - الجزء السابع', type: 'kutub', collection: 'shia', totalHadiths: 892 },
    { id: 'alkafi-8', name: 'Al-Kafi (Vol 8)', arabic: 'الكافي - الجزء الثامن', type: 'kutub', collection: 'shia', totalHadiths: 596 },
    { id: 'al-amali-mufid', name: "Al-Amali (Mufid)", arabic: 'الأمالي (المفيد)', type: 'primary', collection: 'shia', totalHadiths: 387 },
    { id: 'al-amali-saduq', name: "Al-Amali (Saduq)", arabic: 'الأمالي (الصدوق)', type: 'primary', collection: 'shia', totalHadiths: 1082 },
    { id: 'al-khisal', name: 'Al-Khisal', arabic: 'الخصال', type: 'primary', collection: 'shia', totalHadiths: 1282 },
    { id: 'al-tawhid', name: 'Al-Tawhid', arabic: 'التوحيد', type: 'primary', collection: 'shia', totalHadiths: 575 },
    { id: 'kitab-al-ghayba-numani', name: 'Kitab al-Ghayba (Numani)', arabic: 'كتاب الغيبة (النعماني)', type: 'primary', collection: 'shia', totalHadiths: 468 },
    { id: 'kitab-al-ghayba-tusi', name: 'Kitab al-Ghayba (Tusi)', arabic: 'كتاب الغيبة (الطوسي)', type: 'primary', collection: 'shia', totalHadiths: 774 },
    { id: 'maani-al-akhbar', name: "Ma'ani al-Akhbar", arabic: 'معاني الأخبار', type: 'primary', collection: 'shia', totalHadiths: 832 },
    { id: 'uyun-rida-1', name: "Uyun al-Rida (Vol 1)", arabic: 'عيون أخبار الرضا - الجزء الأول', type: 'primary', collection: 'shia', totalHadiths: 347 },
    { id: 'uyun-rida-2', name: "Uyun al-Rida (Vol 2)", arabic: 'عيون أخبار الرضا - الجزء الثاني', type: 'primary', collection: 'shia', totalHadiths: 607 },
    { id: 'kamil-al-ziyarat', name: 'Kamil al-Ziyyarat', arabic: 'كامل الزيارات', type: 'primary', collection: 'shia', totalHadiths: 750 }
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