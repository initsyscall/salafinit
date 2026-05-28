window.BookmarkPicker = window.BookmarkPicker || (() => {
  function show({ refId, type, title, ref, route, text, onToggle }) {
    const overlay = document.createElement('div');
    overlay.className = 'bm-picker-overlay';

    const panel = document.createElement('div');
    panel.className = 'bm-picker';

    panel.innerHTML = `
      <p class="bm-picker__title">Save to…</p>
      <div class="bm-picker__list"></div>
      <div class="bm-picker__new">
        <input class="bm-picker__input" placeholder="+ New heading" />
      </div>
    `;

    overlay.appendChild(panel);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
    document.body.appendChild(overlay);

    const list = panel.querySelector('.bm-picker__list');
    const input = panel.querySelector('.bm-picker__input');
    let savedIds = new Set();
    let bmIds = {};

    async function load() {
      const headings = await BookmarkDB.getAllHeadings();
      const existing = await BookmarkDB.getBookmarksByRefId(refId);
      savedIds = new Set(existing.map(b => b.headingId));
      bmIds = {};
      existing.forEach(b => { bmIds[b.headingId] = b.id; });
      render(headings);
    }

    function render(headings) {
      list.innerHTML = '';
      headings.forEach(h => {
        const isSaved = savedIds.has(h.id);
        const item = document.createElement('button');
        item.className = `bm-picker__item${isSaved ? ' bm-picker__item--saved' : ''}`;
        item.innerHTML = `<span>${h.name}</span><span class="bm-picker__check">${isSaved ? '✓' : ''}</span>`;
        item.addEventListener('click', async () => {
          if (isSaved) {
            await BookmarkDB.removeBookmark(bmIds[h.id]);
            savedIds.delete(h.id);
            delete bmIds[h.id];
          } else {
            const id = await BookmarkDB.addBookmark({ refId, headingId: h.id, type, title, ref, route, text, savedAt: Date.now() });
            savedIds.add(h.id);
            bmIds[h.id] = id;
          }
          render(headings);
          if (onToggle) onToggle(savedIds.size > 0);
        });
        list.appendChild(item);
      });
    }

    input.addEventListener('keydown', async (e) => {
      if (e.key === 'Enter' && input.value.trim()) {
        const name = input.value.trim();
        const newId = await BookmarkDB.addHeading({ name, createdAt: Date.now() });
        const bmId = await BookmarkDB.addBookmark({ refId, headingId: newId, type, title, ref, route, text, savedAt: Date.now() });
        savedIds.add(newId);
        bmIds[newId] = bmId;
        input.value = '';
        const headings = await BookmarkDB.getAllHeadings();
        render(headings);
        if (onToggle) onToggle(true);
      }
    });

    load();
  }

  function close() {
    const el = document.querySelector('.bm-picker-overlay');
    if (el) el.remove();
  }

  return { show, close };
})();
