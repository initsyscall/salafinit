const HadithApi = (() => {
  function getSunniBooks() {
    return HadithBooks.getSunni();
  }

  function getShiaBooks() {
    return HadithBooks.getShia();
  }

  function getAllBooks() {
    return HadithBooks.getAll();
  }

  async function getBookChapters(collection, bookId) {
    return await HadithFetcher.getBookChapters(collection, bookId);
  }

  async function getSingleHadith(collection, bookId, hadithNum) {
    return HadithFetcher.findHadithByNumber(collection, bookId, hadithNum);
  }

  function normalizeCollection(collection) {
    if (!collection) return 'sunni';
    const lower = collection.toLowerCase();
    if (lower === 'sunni' || lower === 'salafi') return 'sunni';
    if (lower === 'shia') return 'shia';
    return 'sunni';
  }

  return {
    getSunniBooks,
    getShiaBooks,
    getAllBooks,
    getBookChapters,
    getSingleHadith,
    normalizeCollection
  };
})();