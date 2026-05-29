const QuickJump = (() => {
  function create(config) {
    const { id, books, routePrefix, getChapterInfo, searchPlaceholder, onSearch, chapterLabel, verseLabel, hideChapter, hideVerse } = config;

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

    const rowChildren = [bookWrapper];

    if (!hideChapter) {
      rowChildren.push(Utils.createElement('input', {
        type: 'number',
        min: '1',
        className: 'input quick-jump-input',
        id: `${id}-jump-chapter`,
        placeholder: chapterLabel || 'Chapter',
        onKeydown: (e) => { if (e.key === 'Enter') onGo(); },
        onChange: onChapterChange
      }));
    }

    if (!hideVerse) {
      rowChildren.push(Utils.createElement('input', {
        type: 'number',
        min: '1',
        className: 'input quick-jump-input',
        id: `${id}-jump-verse`,
        placeholder: verseLabel || 'Verse',
        onKeydown: (e) => { if (e.key === 'Enter') onGo(); }
      }));
    }

    if (searchPlaceholder) {
      rowChildren.push(
        Utils.createElement('input', {
          type: 'text',
          className: 'input quick-jump-input',
          id: `${id}-jump-search`,
          placeholder: searchPlaceholder,
          onKeydown: (e) => { if (e.key === 'Enter') onGo(); }
        })
      );
    }

    rowChildren.push(Utils.createElement('button', {
      className: 'btn btn--ghost',
      id: `${id}-jump-go`,
      onClick: onGo
    }, 'Go'));

    const section = Utils.createElement('div', { className: 'quick-jump' }, [
      Utils.createElement('h2', { className: 'quick-jump-title' }, 'Quick Jump'),
      Utils.createElement('div', { className: 'quick-jump-row' }, rowChildren)
    ]);

    function onBookChange() {
      const bookId = document.getElementById(`${id}-jump-book`).value;
      const book = books.find(b => b.id === bookId);
      if (book) {
        if (hideChapter) {
          const vInput = document.getElementById(`${id}-jump-verse`);
          vInput.value = '';
          vInput.max = book.chapters;
          vInput.placeholder = `1 – ${book.chapters}`;
        } else {
          const chInput = document.getElementById(`${id}-jump-chapter`);
          chInput.value = '';
          chInput.max = book.chapters;
          chInput.placeholder = `1 – ${book.chapters}`;
          if (!hideVerse) {
            const vInput = document.getElementById(`${id}-jump-verse`);
            vInput.value = '';
            vInput.removeAttribute('max');
            vInput.placeholder = verseLabel || 'Verse';
          }
        }
      } else {
        if (!hideChapter) {
          const chInput = document.getElementById(`${id}-jump-chapter`);
          chInput.removeAttribute('max');
          chInput.placeholder = chapterLabel || 'Chapter';
        }
        if (!hideVerse) {
          const vInput = document.getElementById(`${id}-jump-verse`);
          vInput.value = '';
          vInput.removeAttribute('max');
          vInput.placeholder = verseLabel || 'Verse';
        }
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
      if (hideChapter || hideVerse) return;
      const bookId = document.getElementById(`${id}-jump-book`).value;
      const ch = parseInt(document.getElementById(`${id}-jump-chapter`).value);
      const vInput = document.getElementById(`${id}-jump-verse`);
      if (!vInput) return;
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
      if (searchPlaceholder && onSearch) {
        const searchVal = document.getElementById(`${id}-jump-search`)?.value.trim();
        if (searchVal) {
          onSearch(searchVal);
          return;
        }
      }
      const bookId = document.getElementById(`${id}-jump-book`).value;
      if (!bookId) return;
      const book = books.find(b => b.id === bookId);
      if (!book) return;
      if (hideChapter) {
        const verse = document.getElementById(`${id}-jump-verse`).value;
        window.location.hash = verse ? `${routePrefix}/${bookId}/${verse}` : `${routePrefix}/${bookId}`;
      } else {
        const ch = parseInt(document.getElementById(`${id}-jump-chapter`).value);
        if (!ch || ch > book.chapters) return;
        const verse = hideVerse ? '' : document.getElementById(`${id}-jump-verse`).value;
        window.location.hash = verse ? `${routePrefix}/${bookId}/${ch}/${verse}` : `${routePrefix}/${bookId}/${ch}`;
      }
    }

    return section;
  }

  return { create };
})();

window.QuickJump = QuickJump;
