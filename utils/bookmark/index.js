window.Bookmark = window.Bookmark || (() => {
  const FOLDER_SVG = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>';
  const BOOK_SVG = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>';
  const BOOKS_SVG = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/><path d="M12 6v7"/><path d="M9 10l3-3 3 3"/></svg>';
  const CHILDREN = [
    { type: 'quran', icon: BOOK_SVG, label: 'Quran' },
    { type: 'hadith', icon: BOOKS_SVG, label: 'Hadith' }
  ];

  function getAllHadithBooks() {
    const all = HadithBooks.getAll();
    return [...all.sunni, ...all.shia].map(b => ({ id: b.id, collection: b.collection, label: b.name, searchText: b.name + ' ' + b.id }));
  }

  let search;
  let sectionsDiv;

  function numberPrompt({ title, label, max }) {
    return new Promise(resolve => {
      const overlay = document.createElement('div');
      overlay.className = 'np-overlay';
      overlay.addEventListener('click', (e) => { if (e.target === overlay) { overlay.remove(); resolve(null); } });

      const card = document.createElement('div');
      card.className = 'np-card';

      const labelEl = document.createElement('p');
      labelEl.className = 'np-label';
      labelEl.textContent = label;

      const input = document.createElement('input');
      input.className = 'np-input';
      input.type = 'number';
      input.min = '1';
      if (max) input.max = String(max);
      input.placeholder = max ? `1-${max}` : 'Number';
      input.autofocus = true;

      const row = document.createElement('div');
      row.className = 'np-row';

      const cancelBtn = document.createElement('button');
      cancelBtn.className = 'np-btn np-btn--cancel';
      cancelBtn.textContent = 'Cancel';
      cancelBtn.addEventListener('click', () => { overlay.remove(); resolve(null); });

      const confirmBtn = document.createElement('button');
      confirmBtn.className = 'np-btn np-btn--confirm';
      confirmBtn.textContent = 'Save';
      confirmBtn.addEventListener('click', () => submit());

      row.appendChild(cancelBtn);
      row.appendChild(confirmBtn);
      card.appendChild(labelEl);
      card.appendChild(input);
      card.appendChild(row);
      overlay.appendChild(card);
      document.body.appendChild(overlay);
      input.focus();

      function submit() {
        const val = input.value.trim();
        if (!val || isNaN(val) || parseInt(val) < 1 || (max && parseInt(val) > max)) {
          input.focus();
          input.select();
          return;
        }
        overlay.remove();
        resolve(parseInt(val));
      }

      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') submit();
        else if (e.key === 'Escape') { overlay.remove(); resolve(null); }
      });
    });
  }

  async function addAyah(headingId) {
    let surahList;
    try {
      const res = await QuranApi.getSurahList();
        surahList = res.data.map(s => ({ id: s.number, numberOfAyahs: s.numberOfAyahs, englishName: s.englishName, label: `${s.number}. ${s.englishName} (${s.englishNameTranslation})`, searchText: `${s.number} ${s.englishName} ${s.englishNameTranslation}` }));
    } catch {
      Utils.showToast('Could not load surah list', 'error');
      return;
    }
    FZF.show({
      placeholder: 'Search surah…',
      items: surahList,
      onSelect: async (surah) => {
        const ayahNum = await numberPrompt({ title: 'Ayah', label: `Ayah number for ${surah.label}`, max: surah.numberOfAyahs });
        if (!ayahNum) return;
        const refId = `quran-${surah.id}-${ayahNum}`;
        if (headingId) {
          await BookmarkDB.addBookmark({ refId, headingId, type: 'quran', title: `${surah.englishName} ${ayahNum}`, ref: `${surah.englishName} ${ayahNum}`, route: `#quran/${surah.id}/${ayahNum}`, text: '', savedAt: Date.now() });
          renderSections();
          Utils.showToast('Bookmarked!', 'success');
        } else {
          saveBookmark('quran', refId, `${surah.englishName} ${ayahNum}`, `${surah.englishName} ${ayahNum}`, `#quran/${surah.id}/${ayahNum}`);
        }
      }
    });
  }

  async function addHadith(headingId) {
    const allBooks = getAllHadithBooks();
    FZF.show({
      placeholder: 'Search hadith collection…',
      items: allBooks,
      onSelect: async (book) => {
        const hadithNum = await numberPrompt({ title: 'Hadith', label: `Hadith number for ${book.label}` });
        if (!hadithNum) return;
        const refId = `hadith-${book.collection}-${book.id}-${hadithNum}`;
        if (headingId) {
          await BookmarkDB.addBookmark({ refId, headingId, type: 'hadith', title: `${book.label} ${hadithNum}`, ref: `${book.label} ${hadithNum}`, route: `#hadiths/${book.collection}/${book.id}/${hadithNum}`, text: '', savedAt: Date.now() });
          renderSections();
          Utils.showToast('Bookmarked!', 'success');
        } else {
          saveBookmark('hadith', refId, `${book.label} ${hadithNum}`, `${book.label} ${hadithNum}`, `#hadiths/${book.collection}/${book.id}/${hadithNum}`);
        }
      }
    });
  }

  async function saveBookmark(type, refId, title, ref, route) {
    const headings = await BookmarkDB.getAllHeadings();
    if (headings.length === 0) {
      const name = prompt('No collections yet. Name your first collection:');
      if (!name || !name.trim()) return;
      const headingId = await BookmarkDB.addHeading({ name: name.trim(), createdAt: Date.now() });
      await BookmarkDB.addBookmark({ refId, headingId, type, title, ref, route, text: '', savedAt: Date.now() });
      renderSections();
      Utils.showToast('Bookmarked!', 'success');
      return;
    }

    BookmarkPicker.show({
      refId, type, title, ref, route, text: '',
      onToggle: (saved) => {
        if (saved) Utils.showToast('Bookmarked!', 'success');
        renderSections();
      }
    });
  }

  async function renderSections() {
    const q = search.value.toLowerCase().trim();
    const headings = await BookmarkDB.getAllHeadings();
    const filtered = q ? headings.filter(h => h.name.toLowerCase().includes(q)) : headings;

    sectionsDiv.innerHTML = '';
    if (filtered.length === 0) {
      sectionsDiv.appendChild(Utils.createElement('p', { className: 'bm-empty' },
        q ? 'No collections found' : 'No collections yet — create one above'));
      return;
    }

    for (const h of filtered) {
      const bookmarks = await BookmarkDB.getBookmarksByHeading(h.id);
      sectionsDiv.appendChild(createParentSection(h, bookmarks));
    }
  }

  function createParentSection(heading, bookmarks) {
    const section = document.createElement('div');
    section.className = 'bm-section bm-section--collapsed';

    const header = document.createElement('button');
    header.className = 'bm-section__header';
    header.innerHTML = `
      <span class="bm-section__name">${heading.name}</span>
      <span class="bm-section__count">${bookmarks.length}</span>
      <button class="bm-section__delete" title="Delete collection">×</button>
      <svg class="bm-section__chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
    `;
    section.appendChild(header);

    const deleteBtn = header.querySelector('.bm-section__delete');
    deleteBtn.addEventListener('click', async (e) => {
      e.stopPropagation();
      if (!confirm(`Delete "${heading.name}" and all its bookmarks?`)) return;
      await BookmarkDB.removeHeading(heading.id);
      section.remove();
    });

    const body = document.createElement('div');
    body.className = 'bm-section__body';

    CHILDREN.forEach(child => {
      const items = bookmarks.filter(b => b.type === child.type);
      body.appendChild(createChildSection(child, items, heading.id));
    });

    section.appendChild(body);

    header.addEventListener('click', () => {
      section.classList.toggle('bm-section--collapsed');
    });

    return section;
  }

  function createChildSection(child, items, headingId) {
    const div = document.createElement('div');
    div.className = 'bm-child bm-child--collapsed';

    const subHeader = document.createElement('button');
    subHeader.className = 'bm-child__header';
    subHeader.innerHTML = `
      <span class="bm-section__icon">${child.icon}</span>
      <span class="bm-child__name">${child.label}</span>
      <span class="bm-section__count">${items.length}</span>
      <svg class="bm-section__chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
    `;
    div.appendChild(subHeader);

    const subBody = document.createElement('div');
    subBody.className = 'bm-child__body';

    if (items.length > 0) {
      items.forEach(b => {
        const item = document.createElement('a');
        item.className = 'bm-item';
        item.href = b.route;
        item.innerHTML = `
          <div class="bm-item__info">
            <span class="bm-item__ref">${b.ref}</span>
            <span class="bm-item__text">${b.text || ''}</span>
          </div>
          <button class="bm-item__remove" title="Remove">×</button>
        `;
        const removeBtn = item.querySelector('.bm-item__remove');
        removeBtn.addEventListener('click', async (e) => {
          e.preventDefault();
          e.stopPropagation();
          await BookmarkDB.removeBookmark(b.id);
          item.remove();
          const c = subHeader.querySelector('.bm-section__count');
          c.textContent = parseInt(c.textContent) - 1;
          const pc = div.closest('.bm-section')?.querySelector('.bm-section__header .bm-section__count');
          if (pc) pc.textContent = parseInt(pc.textContent) - 1;
          if (subBody.querySelectorAll('.bm-item').length === 0) {
            const addBtn = subBody.querySelector('.bm-child__add-btn');
            subBody.innerHTML = '';
            subBody.appendChild(addBtn || createAddBtn());
          }
        });
        subBody.appendChild(item);
      });
    }

    subBody.appendChild(createAddBtn());
    div.appendChild(subBody);

    subHeader.addEventListener('click', () => {
      div.classList.toggle('bm-child--collapsed');
    });

    return div;

    function createAddBtn() {
      const btn = document.createElement('button');
      btn.className = 'bm-child__add-btn';
      const label = child.type === 'quran' ? 'Ayah' : 'Hadith';
      btn.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg> ${label}`;
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (child.type === 'quran') addAyah(headingId);
        else addHadith(headingId);
      });
      return btn;
    }
  }

  async function render(container) {
    container.innerHTML = '';
    const page = Utils.createElement('div', { className: 'bm-page' });

    page.appendChild(Utils.createElement('button', {
      className: 'bm-back',
      onClick: () => window.location.hash = '#utils'
    }, '← Back'));

    page.appendChild(Utils.createElement('div', { className: 'bm-header' }, [
      Utils.createElement('h1', { className: 'bm-title' }, 'Bookmarked'),
      Utils.createElement('p', { className: 'bm-subtitle' }, 'Saved verses and hadith in your collections')
    ]));

    search = Utils.createElement('input', {
      className: 'bm-search',
      placeholder: '🔍  Search collections…',
      onInput: renderSections
    });
    page.appendChild(search);

    sectionsDiv = Utils.createElement('div', { className: 'bm-sections' });
    page.appendChild(sectionsDiv);

    const newInput = Utils.createElement('input', {
      className: 'bm-new__input',
      placeholder: '+ New Collection',
      onKeydown: async (e) => {
        if (e.key === 'Enter' && e.target.value.trim()) {
          await BookmarkDB.addHeading({ name: e.target.value.trim(), createdAt: Date.now() });
          e.target.value = '';
          renderSections();
        }
      }
    });
    page.appendChild(Utils.createElement('div', { className: 'bm-new' }, [newInput]));

    container.appendChild(page);
    renderSections();
  }

  return { render };
})();
