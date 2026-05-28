const QuickJump = (() => {
  function create(config) {
    const { id, books, routePrefix, getChapterInfo } = config;

    const bookWrapper = document.createElement('div');
    bookWrapper.className = 'quick-jump-search';

    const hiddenBookId = document.createElement('input');
    hiddenBookId.type = 'hidden';
    hiddenBookId.id = `${id}-jump-book`;

    const bookInput = document.createElement('input');
    bookInput.type = 'text';
    bookInput.className = 'input quick-jump-input quick-jump-search-input';
    bookInput.id = `${id}-book-search`;
    bookInput.placeholder = 'Search books...';
    bookInput.autocomplete = 'off';
    bookInput.addEventListener('input', onBookSearchInput);
    bookInput.addEventListener('keydown', onBookSearchKeydown);
    bookInput.addEventListener('blur', () => setTimeout(hideDropdown, 200));

    const bookDropdown = document.createElement('div');
    bookDropdown.className = 'quick-jump-dropdown';
    bookDropdown.id = `${id}-book-dropdown`;

    bookWrapper.appendChild(bookInput);
    bookWrapper.appendChild(bookDropdown);
    bookWrapper.appendChild(hiddenBookId);

    const section = Utils.createElement('div', { className: 'quick-jump' }, [
      Utils.createElement('h2', { className: 'quick-jump-title' }, 'Quick Jump'),
      Utils.createElement('div', { className: 'quick-jump-row' }, [
        bookWrapper,
        Utils.createElement('input', {
          type: 'number',
          min: '1',
          className: 'input quick-jump-input',
          id: `${id}-jump-chapter`,
          placeholder: 'Chapter',
          onKeydown: (e) => { if (e.key === 'Enter') onGo(); },
          onChange: onChapterChange
        }),
        Utils.createElement('input', {
          type: 'number',
          min: '1',
          className: 'input quick-jump-input',
          id: `${id}-jump-verse`,
          placeholder: 'Verse',
          onKeydown: (e) => { if (e.key === 'Enter') onGo(); }
        }),
        Utils.createElement('button', {
          className: 'btn btn--ghost',
          id: `${id}-jump-go`,
          onClick: onGo
        }, 'Go')
      ])
    ]);

    function onBookChange() {
      const bookId = document.getElementById(`${id}-jump-book`).value;
      const chInput = document.getElementById(`${id}-jump-chapter`);
      const vInput = document.getElementById(`${id}-jump-verse`);
      chInput.value = '';
      vInput.value = '';
      vInput.removeAttribute('max');
      vInput.placeholder = 'Verse';
      const book = books.find(b => b.id === bookId);
      if (book) {
        chInput.max = book.chapters;
        chInput.placeholder = `1 – ${book.chapters}`;
      } else {
        chInput.removeAttribute('max');
        chInput.placeholder = 'Chapter';
      }
    }

    function onBookSearchInput() {
      const query = document.getElementById(`${id}-book-search`).value.toLowerCase().trim();
      const dropdown = document.getElementById(`${id}-book-dropdown`);
      document.getElementById(`${id}-jump-book`).value = '';
      onBookChange();

      if (!query) { dropdown.classList.remove('visible'); return; }

      const matches = books.filter(b =>
        b.name.toLowerCase().includes(query) || b.id.includes(query)
      );

      dropdown.innerHTML = '';
      if (!matches.length) {
        dropdown.innerHTML = '<div class="quick-jump-dropdown-empty">No books found</div>';
        dropdown.classList.add('visible');
        return;
      }

      matches.forEach(b => {
        const item = document.createElement('div');
        item.className = 'quick-jump-dropdown-item';
        item.textContent = b.name;
        item.dataset.id = b.id;
        item.addEventListener('mousedown', e => { e.preventDefault(); selectBook(b); });
        dropdown.appendChild(item);
      });
      dropdown.classList.add('visible');
    }

    function onBookSearchKeydown(e) {
      const dropdown = document.getElementById(`${id}-book-dropdown`);
      const items = [...dropdown.querySelectorAll('.quick-jump-dropdown-item')];
      if (!items.length) return;

      const active = dropdown.querySelector('.active');

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const idx = active ? items.indexOf(active) + 1 : 0;
        if (idx < items.length) { active?.classList.remove('active'); items[idx].classList.add('active'); }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const idx = active ? items.indexOf(active) - 1 : items.length - 1;
        if (idx >= 0) { active?.classList.remove('active'); items[idx].classList.add('active'); }
      } else if (e.key === 'Enter') {
        const target = active || (items.length === 1 ? items[0] : null);
        if (target) { e.preventDefault(); selectBook(books.find(b => b.id === target.dataset.id)); }
      } else if (e.key === 'Escape') {
        hideDropdown();
      }
    }

    function hideDropdown() {
      document.getElementById(`${id}-book-dropdown`)?.classList.remove('visible');
    }

    function selectBook(book) {
      document.getElementById(`${id}-book-search`).value = book.name;
      document.getElementById(`${id}-jump-book`).value = book.id;
      hideDropdown();
      onBookChange();
    }

    async function onChapterChange() {
      const bookId = document.getElementById(`${id}-jump-book`).value;
      const ch = parseInt(document.getElementById(`${id}-jump-chapter`).value);
      const vInput = document.getElementById(`${id}-jump-verse`);
      vInput.value = '';
      vInput.removeAttribute('max');

      if (!bookId || !ch) return;

      const book = books.find(b => b.id === bookId);
      if (!book || ch > book.chapters) return;

      if (getChapterInfo) {
        try {
          const info = await getChapterInfo(bookId, ch);
          if (info?.verseCount) {
            vInput.max = info.verseCount;
            vInput.placeholder = `1 – ${info.verseCount}`;
          }
        } catch (e) { /* verse range unavailable */ }
      }
    }

    function onGo() {
      const bookId = document.getElementById(`${id}-jump-book`).value;
      const ch = parseInt(document.getElementById(`${id}-jump-chapter`).value);
      const verse = document.getElementById(`${id}-jump-verse`).value;
      if (bookId && ch > 0) {
        const book = books.find(b => b.id === bookId);
        if (!book || ch > book.chapters) return;
        window.location.hash = verse ? `${routePrefix}/${bookId}/${ch}/${verse}` : `${routePrefix}/${bookId}/${ch}`;
      }
    }

    return section;
  }

  return { create };
})();

window.QuickJump = QuickJump;
