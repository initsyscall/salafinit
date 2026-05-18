const BookmarkStorage = (() => {
  const KEY = 'bookmarks';

  function getAll() {
    return Store.get(KEY, []);
  }

  function add(item) {
    const bookmarks = getAll();
    if (bookmarks.some(b => b.id === item.id && b.type === item.type)) {
      return false;
    }
    bookmarks.push({ ...item, savedAt: Date.now() });
    Store.set(KEY, bookmarks);
    return true;
  }

  function remove(id, type) {
    const bookmarks = getAll().filter(b => !(b.id === id && b.type === type));
    Store.set(KEY, bookmarks);
  }

  function isBookmarked(id, type) {
    return getAll().some(b => b.id === id && b.type === type);
  }

  return { getAll, add, remove, isBookmarked };
})();