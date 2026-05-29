window.BookmarkDB = window.BookmarkDB || (() => {
  const DB_NAME = 'salafinit-bookmarks';
  const DB_VERSION = 2;
  let db = null;
  let ready = null;

  function open() {
    if (db) return Promise.resolve(db);
    if (ready) return ready;
    ready = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = (e) => {
        const d = e.target.result;
        const tx = e.target.transaction;
        if (d.objectStoreNames.contains('headings')) d.deleteObjectStore('headings');
        if (d.objectStoreNames.contains('bookmarks')) d.deleteObjectStore('bookmarks');
        d.createObjectStore('headings', { keyPath: 'id', autoIncrement: true });
        const s = d.createObjectStore('bookmarks', { keyPath: 'id', autoIncrement: true });
        s.createIndex('headingId', 'headingId', { unique: false });
        s.createIndex('refId', 'refId', { unique: false });
      };
      req.onsuccess = (e) => { db = e.target.result; resolve(db); };
      req.onerror = (e) => { ready = null; reject(e.target.error); };
    });
    return ready;
  }

  function getAll(store) {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(store, 'readonly');
      const req = tx.objectStore(store).getAll();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  function getByIndex(store, index, key) {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(store, 'readonly');
      const req = tx.objectStore(store).index(index).getAll(IDBKeyRange.only(key));
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async function getAllHeadings() {
    await open();
    return getAll('headings');
  }

  async function addHeading(data) {
    await open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('headings', 'readwrite');
      const req = tx.objectStore('headings').add(data);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async function removeHeading(id) {
    await open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['headings', 'bookmarks'], 'readwrite');
      tx.objectStore('headings').delete(id);
      const req = tx.objectStore('bookmarks').index('headingId').getAllKeys(IDBKeyRange.only(id));
      req.onsuccess = () => req.result.forEach(k => tx.objectStore('bookmarks').delete(k));
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async function renameHeading(id, name) {
    await open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('headings', 'readwrite');
      const req = tx.objectStore('headings').get(id);
      req.onsuccess = () => {
        const h = req.result;
        h.name = name;
        tx.objectStore('headings').put(h);
      };
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async function getBookmarksByHeading(headingId) {
    await open();
    return getByIndex('bookmarks', 'headingId', headingId);
  }

  async function getBookmarksByRefId(refId) {
    await open();
    return getByIndex('bookmarks', 'refId', refId);
  }

  async function addBookmark(data) {
    await open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('bookmarks', 'readwrite');
      const req = tx.objectStore('bookmarks').add(data);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async function removeBookmark(id) {
    await open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('bookmarks', 'readwrite');
      tx.objectStore('bookmarks').delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async function updateLastInteracted(id) {
    await open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('bookmarks', 'readwrite');
      const req = tx.objectStore('bookmarks').get(id);
      req.onsuccess = () => {
        const b = req.result;
        if (b) {
          b.lastInteracted = Date.now();
          tx.objectStore('bookmarks').put(b);
        }
      };
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async function getAllBookmarks() {
    await open();
    return getAll('bookmarks');
  }

  async function isBookmarked(refId) {
    const existing = await getBookmarksByRefId(refId);
    return existing.length > 0;
  }

  return {
    getAllHeadings, addHeading, removeHeading, renameHeading,
    getBookmarksByHeading, getBookmarksByRefId,
    addBookmark, removeBookmark, isBookmarked,
    updateLastInteracted, getAllBookmarks
  };
})();
