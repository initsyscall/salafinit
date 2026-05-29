window.Bookmark = window.Bookmark || (() => {
  const SUBHEADINGS = [
    { id: 'quran', type: 'quran', label: 'Quran', color: '#F6C177', addLabel: 'Ayah' },
    { id: 'hadith-sunni', type: 'hadith/sunni', label: 'Hadiths', color: 'var(--color-primary)', addLabel: 'Hadith', collection: 'sunni' },
    { id: 'hadith-shia', type: 'hadith/shia', label: 'Shia Hadiths', color: '#EF4444', addLabel: 'Hadith', collection: 'shia' },
    { id: 'other-bible', type: 'other/bible', label: 'Bible', color: '#B55454', addLabel: 'Verse' },
    { id: 'other-judaism', type: 'other/judaism', label: 'Judaism', color: '#5699C9', addLabel: 'Verse' },
    { id: 'other-hinduism', type: 'other/hinduism', label: 'Hinduism', color: '#D4764A', addLabel: 'Verse' }
  ];

  const IMPORT_SVG = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>';
  const EXPORT_SVG = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>';

  function matchesType(bookmarkType, subType) {
    if (bookmarkType === subType) return true;
    if (bookmarkType === 'hadith' && (subType === 'hadith/sunni' || subType === 'hadith/shia')) return true;
    return false;
  }

  let search;
  let sectionsDiv;

  function numberPrompt({ label, max }) {
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
        const ayahNum = await numberPrompt({ label: `Ayah number for ${surah.label}`, max: surah.numberOfAyahs });
        if (!ayahNum) return;
        const refId = `quran-${surah.id}-${ayahNum}`;
        await BookmarkDB.addBookmark({ refId, headingId, type: 'quran', title: `${surah.englishName} ${ayahNum}`, ref: `${surah.englishName} ${ayahNum}`, route: `#quran/${surah.id}/${ayahNum}`, text: '', savedAt: Date.now(), lastInteracted: Date.now() });
        renderSections();
        Utils.showToast('Bookmarked!', 'success');
      }
    });
  }

  async function addHadith(headingId, collection) {
    const books = (() => {
      const all = HadithBooks.getAll();
      const list = all[collection] || [];
      return list.map(b => ({ id: b.id, collection: b.collection, label: b.name, searchText: b.name + ' ' + b.id }));
    })();
    FZF.show({
      placeholder: 'Search hadith collection…',
      items: books,
      onSelect: async (book) => {
        const hadithNum = await numberPrompt({ label: `Hadith number for ${book.label}` });
        if (!hadithNum) return;
        const refId = `hadith-${book.collection}-${book.id}-${hadithNum}`;
        const type = `hadith/${book.collection}`;
        await BookmarkDB.addBookmark({ refId, headingId, type, title: `${book.label} ${hadithNum}`, ref: `${book.label} ${hadithNum}`, route: `#hadiths/${book.collection}/${book.id}/${hadithNum}`, text: '', savedAt: Date.now(), lastInteracted: Date.now() });
        renderSections();
        Utils.showToast('Bookmarked!', 'success');
      }
    });
  }

  async function addBible(headingId) {
    const books = BibleBooks.getAll().map(b => ({ id: b.id, label: b.name, chapters: b.chapters, searchText: b.name + ' ' + b.id }));
    FZF.show({
      placeholder: 'Search bible book…',
      items: books,
      onSelect: async (book) => {
        const chapterNum = await numberPrompt({ label: `Chapter for ${book.label} (1-${book.chapters})`, max: book.chapters });
        if (!chapterNum) return;
        const verseNum = await numberPrompt({ label: `Verse for ${book.label} ${chapterNum}` });
        if (!verseNum) return;
        const refId = `bible-${book.id}-${chapterNum}-${verseNum}`;
        await BookmarkDB.addBookmark({ refId, headingId, type: 'other/bible', title: `${book.label} ${chapterNum}:${verseNum}`, ref: `${book.label} ${chapterNum}:${verseNum}`, route: `#learn/other/bible/${book.id}/${chapterNum}/${verseNum}`, text: '', savedAt: Date.now(), lastInteracted: Date.now() });
        renderSections();
        Utils.showToast('Bookmarked!', 'success');
      }
    });
  }

  async function addJudaism(headingId) {
    const books = JudaismBooks.getAll().map(b => ({ id: b.id, label: b.name, chapters: b.chapters, searchText: b.name + ' ' + b.id }));
    FZF.show({
      placeholder: 'Search tanakh book…',
      items: books,
      onSelect: async (book) => {
        const chapterNum = await numberPrompt({ label: `Chapter for ${book.label} (1-${book.chapters})`, max: book.chapters });
        if (!chapterNum) return;
        const verseNum = await numberPrompt({ label: `Verse for ${book.label} ${chapterNum}` });
        if (!verseNum) return;
        const refId = `judaism-${book.id}-${chapterNum}-${verseNum}`;
        await BookmarkDB.addBookmark({ refId, headingId, type: 'other/judaism', title: `${book.label} ${chapterNum}:${verseNum}`, ref: `${book.label} ${chapterNum}:${verseNum}`, route: `#learn/other/judaism/${book.id}/${chapterNum}/${verseNum}`, text: '', savedAt: Date.now(), lastInteracted: Date.now() });
        renderSections();
        Utils.showToast('Bookmarked!', 'success');
      }
    });
  }

  async function addHinduism(headingId) {
    const books = HinduismBooks.getAvailable().map(b => {
      const cfg = HinduismBooks.getBookConfig(b) || {};
      return { id: b.id, label: b.name, chapters: b.chapters, chapterLabel: cfg.chapterLabel || 'Chapter', verseLabel: cfg.verseLabel || 'Verse', searchText: b.name + ' ' + b.id };
    });
    FZF.show({
      placeholder: 'Search scripture…',
      items: books,
      onSelect: async (book) => {
        const chapterNum = await numberPrompt({ label: `${book.chapterLabel} for ${book.label} (1-${book.chapters})`, max: book.chapters });
        if (!chapterNum) return;
        const verseNum = await numberPrompt({ label: `${book.verseLabel} for ${book.label} ${book.chapterLabel} ${chapterNum}` });
        if (!verseNum) return;
        const refId = `hinduism-${book.id}-${chapterNum}-${verseNum}`;
        await BookmarkDB.addBookmark({ refId, headingId, type: 'other/hinduism', title: `${book.label} ${chapterNum}:${verseNum}`, ref: `${book.label} ${chapterNum}:${verseNum}`, route: `#learn/other/hinduism/${book.id}/${chapterNum}/${verseNum}`, text: '', savedAt: Date.now(), lastInteracted: Date.now() });
        renderSections();
        Utils.showToast('Bookmarked!', 'success');
      }
    });
  }

  function showAddMenu(headingId) {
    const overlay = document.createElement('div');
    overlay.className = 'bm-menu-overlay';
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
    const panel = document.createElement('div');
    panel.className = 'bm-menu';
    panel.innerHTML = '<p class="bm-menu__title">Add Bookmark</p><div class="bm-menu__list"></div>';
    const list = panel.querySelector('.bm-menu__list');
    SUBHEADINGS.forEach(sub => {
      const btn = document.createElement('button');
      btn.className = 'bm-menu__item';
      btn.style.setProperty('--sub-color', sub.color);
      btn.innerHTML = `<span class="bm-menu__dot"></span><span>${sub.label}</span>`;
      btn.addEventListener('click', () => {
        overlay.remove();
        if (sub.type === 'quran') addAyah(headingId);
        else if (sub.type.startsWith('hadith/')) addHadith(headingId, sub.collection);
        else if (sub.type === 'other/bible') addBible(headingId);
        else if (sub.type === 'other/judaism') addJudaism(headingId);
        else if (sub.type === 'other/hinduism') addHinduism(headingId);
      });
      list.appendChild(btn);
    });
    overlay.appendChild(panel);
    document.body.appendChild(overlay);
  }

  async function renderSections() {
    const expanded = {};
    sectionsDiv.querySelectorAll('.bm-section').forEach(s => {
      const n = s.querySelector('.bm-section__name')?.textContent;
      if (n) {
        expanded[n] = { open: !s.classList.contains('bm-section--collapsed'), sub: {} };
        s.querySelectorAll('.bm-subheading').forEach(sub => {
          const label = sub.querySelector('.bm-subheading__name')?.textContent;
          if (label) expanded[n].sub[label] = !sub.classList.contains('bm-subheading--collapsed');
        });
      }
    });

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
      sectionsDiv.appendChild(createParentSection(h, bookmarks, expanded[h.name]));
    }
  }

  function createParentSection(heading, bookmarks, state) {
    const isOpen = state ? state.open : false;
    const subStates = state ? state.sub : {};
    const section = document.createElement('div');
    section.className = 'bm-section' + (isOpen ? '' : ' bm-section--collapsed');

    const header = document.createElement('button');
    header.className = 'bm-section__header';

    let dltLast = 0;
    const fi = document.createElement('input');
    fi.type = 'file';
    fi.accept = '.json';
    fi.style.display = 'none';
    fi.addEventListener('change', async (e) => {
      if (e.target.files[0]) {
        try {
          const text = await e.target.files[0].text();
          const data = JSON.parse(text);
          const bms = data.bookmarks || [];
          for (const b of bms) {
            await BookmarkDB.addBookmark({
              refId: b.refId, headingId: heading.id, type: b.type,
              title: b.title, ref: b.ref, route: b.route,
              text: b.text || '', savedAt: b.savedAt || Date.now(),
              lastInteracted: b.lastInteracted || 0
            });
          }
          renderSections();
          Utils.showToast('Import complete!', 'success');
        } catch (err) {
          Utils.showToast('Import failed: ' + err.message, 'error');
        }
      }
      e.target.value = '';
    });

    header.innerHTML = `
      <span class="bm-section__name">${heading.name}</span>
      <span class="bm-section__acts">
        <span class="bm-section__dlt" title="Double-click to delete"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="8" y1="12" x2="16" y2="12"/></svg></span>
        <span class="bm-section__imp" title="Import into this collection">${IMPORT_SVG}</span>
        <span class="bm-section__exp" title="Export this collection">${EXPORT_SVG}</span>
      </span>
      <svg class="bm-section__chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
    `;
    section.appendChild(header);

    header.querySelector('.bm-section__dlt').addEventListener('click', async (e) => {
      e.stopPropagation();
      const now = Date.now();
      if (now - dltLast < 500) {
        dltLast = 0;
        await BookmarkDB.removeHeading(heading.id);
        section.remove();
      } else dltLast = now;
    });

    header.querySelector('.bm-section__imp').addEventListener('click', (e) => {
      e.stopPropagation();
      fi.click();
    });
    header.appendChild(fi);

    header.querySelector('.bm-section__exp').addEventListener('click', async (e) => {
      e.stopPropagation();
      const bms = await BookmarkDB.getBookmarksByHeading(heading.id);
      const blob = new Blob([JSON.stringify({ heading: { name: heading.name }, bookmarks: bms }, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${heading.name}-default.json`;
      a.click();
      URL.revokeObjectURL(url);
    });

    const body = document.createElement('div');
    body.className = 'bm-section__body';

    SUBHEADINGS.forEach(sub => {
      const items = bookmarks.filter(b => matchesType(b.type, sub.type));
      if (items.length === 0) return;

      const subOpen = subStates[sub.label] !== false;
      const subDiv = document.createElement('div');
      subDiv.className = 'bm-subheading' + (subOpen ? '' : ' bm-subheading--collapsed');
      subDiv.style.setProperty('--sub-color', sub.color);

      const labelRow = document.createElement('div');
      labelRow.className = 'bm-subheading__label';
      labelRow.innerHTML = `
        <span class="bm-subheading__dot"></span>
        <span class="bm-subheading__name">${sub.label}</span>
        <span class="bm-section__count">${items.length}</span>
        <svg class="bm-subheading__chevron" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
      `;
      labelRow.addEventListener('click', (e) => {
        e.stopPropagation();
        subDiv.classList.toggle('bm-subheading--collapsed');
      });
      subDiv.appendChild(labelRow);

      const subBody = document.createElement('div');
      subBody.className = 'bm-subheading__body';

      items.sort((a, b) => (b.lastInteracted || 0) - (a.lastInteracted || 0));

      items.forEach(b => {
        const link = document.createElement('a');
        link.className = 'bm-item';
        link.href = b.route;
        link.innerHTML = `
          <div class="bm-item__info">
            <span class="bm-item__ref">${b.ref}</span>
            <span class="bm-item__text">${b.text || ''}</span>
          </div>
          <button class="bm-item__remove" title="Remove">×</button>
        `;
        link.querySelector('.bm-item__remove').addEventListener('click', async (e) => {
          e.preventDefault();
          e.stopPropagation();
          await BookmarkDB.removeBookmark(b.id);
          const countEl = subDiv.querySelector('.bm-section__count');
          countEl.textContent = Math.max(0, parseInt(countEl.textContent) - 1);
          link.remove();
          if (subBody.querySelectorAll('.bm-item').length === 0) subDiv.remove();
        });
        link.addEventListener('click', () => {
          BookmarkDB.updateLastInteracted(b.id).catch(() => {});
        });
        subBody.appendChild(link);
      });

      subDiv.appendChild(subBody);
      body.appendChild(subDiv);
    });

    const addBtn = document.createElement('button');
    addBtn.className = 'bm-add-subheading-btn';
    addBtn.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg> Add';
    addBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      showAddMenu(heading.id);
    });
    body.appendChild(addBtn);

    section.appendChild(body);
    header.addEventListener('click', () => {
      section.classList.toggle('bm-section--collapsed');
    });

    return section;
  }

  async function deleteAllData() {
    const headings = await BookmarkDB.getAllHeadings();
    for (const h of headings) await BookmarkDB.removeHeading(h.id);
    renderSections();
    Utils.showToast('All bookmarks deleted', 'success');
  }

  async function exportData() {
    const headings = await BookmarkDB.getAllHeadings();
    const books = [];
    for (const h of headings) {
      const bms = await BookmarkDB.getBookmarksByHeading(h.id);
      books.push(...bms.map(b => ({ ...b, headingName: h.name })));
    }
    const data = { headings, bookmarks: books, exportedAt: Date.now() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const d = new Date();
    const ds = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    a.download = `salafInit-Bookmark-${ds}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function importData(file) {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (!data.headings || !data.bookmarks) throw new Error('Invalid format');
      for (const h of data.headings) {
        const newId = await BookmarkDB.addHeading({ name: h.name, createdAt: h.createdAt || Date.now() });
        const bms = data.bookmarks.filter(b => b.headingName === h.name || b.headingId === h.id);
        for (const b of bms) {
          await BookmarkDB.addBookmark({
            refId: b.refId, headingId: newId, type: b.type,
            title: b.title, ref: b.ref, route: b.route,
            text: b.text || '', savedAt: b.savedAt || Date.now(),
            lastInteracted: b.lastInteracted || 0
          });
        }
      }
      renderSections();
      Utils.showToast('Import complete!', 'success');
    } catch (e) {
      Utils.showToast('Import failed: ' + e.message, 'error');
    }
  }

  async function render(container) {
    container.innerHTML = '';
    const page = Utils.createElement('div', { className: 'bm-page' });

    page.appendChild(Utils.createElement('button', {
      className: 'bm-back',
      onClick: () => window.location.hash = '#utils'
    }, '← Back'));

    page.appendChild(Utils.createElement('h1', { className: 'bm-title' }, 'Bookmarked'));

    search = Utils.createElement('input', {
      className: 'bm-search',
      placeholder: '🔍  Search collections…',
      onInput: renderSections
    });
    page.appendChild(search);

    const ioRow = Utils.createElement('div', { className: 'bm-io-row' });

    ioRow.appendChild(Utils.createElement('button', {
      className: 'bm-io-btn',
      title: 'Delete all collections',
      innerHTML: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="8" y1="12" x2="16" y2="12"/></svg>',
      onClick: async () => {
        if (!confirm('Delete all collections and bookmarks?')) return;
        await deleteAllData();
      }
    }));

    const fi = document.createElement('input');
    fi.type = 'file';
    fi.accept = '.json';
    fi.style.display = 'none';
    fi.addEventListener('change', (e) => {
      if (e.target.files[0]) importData(e.target.files[0]);
      e.target.value = '';
    });
    ioRow.appendChild(Utils.createElement('button', {
      className: 'bm-io-btn',
      title: 'Import all collections',
      innerHTML: IMPORT_SVG.replace('width="14"', 'width="16"').replace('height="14"', 'height="16"'),
      onClick: () => fi.click()
    }, fi));

    ioRow.appendChild(Utils.createElement('button', {
      className: 'bm-io-btn',
      title: 'Export all collections',
      innerHTML: EXPORT_SVG.replace('width="14"', 'width="16"').replace('height="14"', 'height="16"'),
      onClick: exportData
    }));

    page.appendChild(ioRow);

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
