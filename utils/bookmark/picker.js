window.BookmarkPicker = window.BookmarkPicker || (() => {
  const RECENTS_KEY = 'bm-recents';

  function getRecents() {
    try { return JSON.parse(localStorage.getItem(RECENTS_KEY)) || []; } catch { return []; }
  }

  function pushRecent(headingId, headingName) {
    let recents = getRecents().filter(r => r.headingId !== headingId);
    recents.unshift({ headingId, headingName, timestamp: Date.now() });
    if (recents.length > 5) recents = recents.slice(0, 5);
    localStorage.setItem(RECENTS_KEY, JSON.stringify(recents));
  }

  function show({ refId, type, title, ref, route, text, onToggle }) {
    const overlay = document.createElement('div');
    overlay.className = 'pk-overlay';
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });

    const panel = document.createElement('div');
    panel.className = 'pk-panel';

    panel.innerHTML = `
      <p class="pk-title">Save to…</p>
      <input class="pk-search" placeholder="🔍  Search collections…" autofocus />
      <div class="pk-recents"></div>
      <div class="pk-list"></div>
      <div class="pk-new-row">
        <input class="pk-new-input" placeholder="+ New Collection" />
      </div>
    `;

    overlay.appendChild(panel);
    document.body.appendChild(overlay);

    const searchInput = panel.querySelector('.pk-search');
    const recentsDiv = panel.querySelector('.pk-recents');
    const listDiv = panel.querySelector('.pk-list');
    const newInput = panel.querySelector('.pk-new-input');

    let savedIds = new Set();
    let bmIds = {};

    async function load() {
      const existing = await BookmarkDB.getBookmarksByRefId(refId);
      savedIds = new Set(existing.map(b => b.headingId));
      bmIds = {};
      existing.forEach(b => { bmIds[b.headingId] = b.id; });
    }

    async function saveToNewHeading(name) {
      const newId = await BookmarkDB.addHeading({ name, createdAt: Date.now() });
      const bmId = await BookmarkDB.addBookmark({ refId, headingId: newId, type, title, ref, route, text, savedAt: Date.now(), lastInteracted: Date.now() });
      savedIds.add(newId);
      bmIds[newId] = bmId;
      pushRecent(newId, name);
      if (onToggle) onToggle(true);
      return newId;
    }

    async function renderRecents() {
      const headings = await BookmarkDB.getAllHeadings();
      const validIds = new Set(headings.map(h => h.id));
      const recents = getRecents().filter(r => r.headingId && validIds.has(r.headingId));
      localStorage.setItem(RECENTS_KEY, JSON.stringify(recents));
      if (recents.length === 0) { recentsDiv.innerHTML = ''; return; }
      recentsDiv.innerHTML = '<div class="pk-recents-label">Recent</div>';
      recents.forEach(r => {
        const btn = document.createElement('button');
        btn.className = 'pk-recent-item';
        btn.textContent = r.headingName;
        btn.addEventListener('click', async () => {
          await toggle(r.headingId);
          renderRecents();
          renderList(searchInput.value);
        });
        recentsDiv.appendChild(btn);
      });
    }

    async function renderList(query) {
      const q = query ? query.toLowerCase().trim() : '';
      if (!q) { listDiv.innerHTML = ''; return; }
      const headings = await BookmarkDB.getAllHeadings();
      const filtered = headings.filter(h => h.name.toLowerCase().includes(q));
      if (filtered.length === 0) {
        listDiv.innerHTML = '<div class="pk-empty">No collections found</div>';
        return;
      }
      listDiv.innerHTML = '';
      filtered.forEach(h => {
        const isSaved = savedIds.has(h.id);
        const item = document.createElement('button');
        item.className = 'pk-item' + (isSaved ? ' pk-item--saved' : '');
        item.innerHTML = `<span>${h.name}</span><span class="pk-check">${isSaved ? '✓' : ''}</span>`;
        item.addEventListener('click', async () => {
          await toggle(h.id);
          renderRecents();
          renderList(q);
        });
        listDiv.appendChild(item);
      });
    }

    async function toggle(headingId) {
      if (savedIds.has(headingId)) {
        await BookmarkDB.removeBookmark(bmIds[headingId]);
        savedIds.delete(headingId);
        delete bmIds[headingId];
      } else {
        const headings = await BookmarkDB.getAllHeadings();
        const h = headings.find(x => x.id === headingId);
        const id = await BookmarkDB.addBookmark({ refId, headingId, type, title, ref, route, text, savedAt: Date.now(), lastInteracted: Date.now() });
        savedIds.add(headingId);
        bmIds[headingId] = id;
        if (h) pushRecent(headingId, h.name);
      }
      if (onToggle) onToggle(savedIds.size > 0);
    }

    newInput.addEventListener('keydown', async (e) => {
      if (e.key === 'Enter' && newInput.value.trim()) {
        await saveToNewHeading(newInput.value.trim());
        newInput.value = '';
        renderRecents();
        renderList(searchInput.value);
      }
    });

    searchInput.addEventListener('input', () => renderList(searchInput.value));

    load().then(async () => {
      await renderRecents();
      renderList('');
    });
  }

  function close() {
    const el = document.querySelector('.pk-overlay');
    if (el) el.remove();
  }

  return { show, close };
})();
