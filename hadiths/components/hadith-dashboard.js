const HadithDashboard = (() => {
  function getBaseRoute(collection) {
    return collection === 'shia' ? '#learn/shia' : '#hadiths';
  }

  function buildRoute(collection, bookId, hadithNum) {
    const base = getBaseRoute(collection);
    if (hadithNum) {
      return `${base}/${bookId}/${hadithNum}`;
    }
    return `${base}/${bookId}`;
  }

  function getGradeInfo(grade, collection, bookId) {
    if (collection === 'shia') {
      return { outline: '#EF4444', label: grade || ' Shia' };
    }
    const g = (grade || '').toLowerCase();
    if (g.includes('sahih') || g.includes('authentic')) {
      const isSahihain = bookId === 'bukhari' || bookId === 'muslim';
      return { outline: isSahihain ? 'var(--color-quran)' : '#10B981', label: grade || 'Sahih' };
    }
    if (g.includes('hasan') || g.includes('good')) {
      return { outline: '#F97316', label: grade || 'Hasan' };
    }
    return { outline: '#EF4444', label: grade || 'Daif' };
  }

  function getGradeClass(grade, bookId) {
    const g = (grade || '').toLowerCase();
    if (g.includes('sahih') || g.includes('authentic')) {
      if (bookId === 'bukhari' || bookId === 'muslim') return 'grade-gold';
      return 'grade-sahih';
    }
    if (g.includes('hasan') || g.includes('good')) return 'grade-hasan';
    return 'grade-daif';
  }

  function createHadithQuickJump(displayBooks, collection) {
    const wrapper = document.createElement('div');
    wrapper.className = 'hadith-book-search';

    const hiddenBookId = document.createElement('input');
    hiddenBookId.type = 'hidden';
    hiddenBookId.id = 'hadith-jump-book';

    const bookInput = document.createElement('input');
    bookInput.type = 'text';
    bookInput.className = 'input hadith-jump-input hadith-book-search-input';
    bookInput.id = 'hadith-book-search';
    bookInput.placeholder = 'Search books...';
    bookInput.autocomplete = 'off';
    bookInput.addEventListener('input', onBookSearchInput);
    bookInput.addEventListener('keydown', onBookSearchKeydown);
    bookInput.addEventListener('blur', () => setTimeout(hideDropdown, 200));

    const bookDropdown = document.createElement('div');
    bookDropdown.className = 'hadith-book-dropdown';
    bookDropdown.id = 'hadith-book-dropdown';

    wrapper.appendChild(bookInput);
    wrapper.appendChild(bookDropdown);
    wrapper.appendChild(hiddenBookId);

    function onBookSearchInput() {
      const query = document.getElementById('hadith-book-search').value.toLowerCase().trim();
      const dropdown = document.getElementById('hadith-book-dropdown');
      document.getElementById('hadith-jump-book').value = '';

      if (!query) { dropdown.classList.remove('visible'); return; }

      const matches = displayBooks.filter(b =>
        b.name.toLowerCase().includes(query) || b.arabic.includes(query) || b.id.includes(query)
      );

      dropdown.innerHTML = '';
      if (!matches.length) {
        dropdown.innerHTML = '<div class="hadith-book-dropdown-empty">No books found</div>';
        dropdown.classList.add('visible');
        return;
      }

      matches.forEach(b => {
        const item = document.createElement('div');
        item.className = 'hadith-book-dropdown-item';
        item.innerHTML = `<span class="hadith-dropdown-arabic">${b.arabic}</span> <span class="hadith-dropdown-name">${b.name}</span>`;
        item.dataset.id = b.id;
        item.addEventListener('mousedown', e => { e.preventDefault(); selectBook(b); });
        dropdown.appendChild(item);
      });
      dropdown.classList.add('visible');
    }

    function onBookSearchKeydown(e) {
      const dropdown = document.getElementById('hadith-book-dropdown');
      const items = [...dropdown.querySelectorAll('.hadith-book-dropdown-item')];
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
        if (target) { e.preventDefault(); selectBook(displayBooks.find(b => b.id === target.dataset.id)); }
      } else if (e.key === 'Escape') {
        hideDropdown();
      }
    }

    function hideDropdown() {
      document.getElementById('hadith-book-dropdown')?.classList.remove('visible');
    }

    function selectBook(book) {
      document.getElementById('hadith-book-search').value = book.name;
      document.getElementById('hadith-jump-book').value = book.id;
      hideDropdown();
      window.location.hash = buildRoute(collection, book.id);
    }

    return wrapper;
  }

  function renderDashboard(container, collection = 'sunni') {
    const { sunni, shia } = HadithApi.getAllBooks();
    const isShia = collection === 'shia';
    const displayBooks = isShia ? shia : sunni;

    const header = Utils.createElement('div', { className: 'hadith-dashboard-header' }, [
      Utils.createElement('svg', {
        className: 'hadith-dashboard-calligraphy',
        viewBox: '0 0 200 60',
        xmlns: 'http://www.w3.org/2000/svg'
      }, [
        Utils.createElement('text', {
          x: '100',
          y: '45',
          'text-anchor': 'middle',
          'font-family': "'Amiri Quran', serif",
          'font-size': '40'
        }, 'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ')
      ]),
      Utils.createElement('h1', { className: `hadith-dashboard-title ${isShia ? 'shia-title' : ''}` }, isShia ? 'Shia Hadiths' : 'Hadiths Collection'),
      Utils.createElement('p', { className: 'hadith-dashboard-subtitle' }, isShia ? 'Academic purposes only' : 'Kutub al-Sittah + More')
    ]);
    container.appendChild(header);

    if (isShia) {
      const warning = Utils.createElement('div', { className: 'hadith-warning' }, [
        Utils.createElement('span', { className: 'hadith-warning-icon' }, '⚠'),
        Utils.createElement('span', {}, 'According to the Salafi manhaj, the hadiths below and their gradings are unreliable and are listed only for the sake of knowledge.')
      ]);
      container.appendChild(warning);
    }

    const searchSection = createHadithQuickJump(displayBooks, collection);
    container.appendChild(searchSection);

    const booksSection = Utils.createElement('div', { className: 'hadith-section' }, [
      Utils.createElement('div', { className: 'hadith-books-grid' })
    ]);
    const booksGrid = booksSection.querySelector('.hadith-books-grid');

    displayBooks.forEach(book => {
      const styleType = collection === 'shia' ? 'shia' : (book.type?.toLowerCase() || 'primary');
      const card = createBookCard(book, collection, styleType);
      booksGrid.appendChild(card);
    });

    container.appendChild(booksSection);

    const footerSection = Utils.createElement('div', { className: 'hadith-footer' }, [
      Utils.createElement('div', { className: 'hadith-translation-setting' }, [
        Utils.createElement('label', { className: 'hadith-translation-label', textContent: 'Translation language:' }),
        Utils.createElement('select', {
          className: 'input hadith-lang-select',
          id: 'translation-lang-select'
        }, [
          ...TranslationModule.getSupportedLanguages().map(lang => 
            Utils.createElement('option', { 
              value: lang.code, 
              textContent: lang.native 
            })
          )
        ]),
        Utils.createElement('button', {
          className: 'btn btn--primary',
          id: 'save-translation-lang-btn',
          style: 'padding: var(--spacing-sm) var(--spacing-md); font-size: var(--font-size-sm);',
          textContent: 'Save'
        })
      ])
    ]);
    container.appendChild(footerSection);

    const langSelect = document.getElementById('translation-lang-select');
    if (langSelect) {
      langSelect.value = TranslationModule.getPreferredLanguage();
    }

    const saveBtn = document.getElementById('save-translation-lang-btn');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        const selectedLang = langSelect.value;
        TranslationModule.setPreferredLanguage(selectedLang);
        Utils.showToast(`Translation language saved to ${langSelect.options[langSelect.selectedIndex].text}`);
      });
    }
  }

  function createBookCard(book, collection, styleType) {
    return Utils.createElement('a', {
      className: `hadith-book-card ${styleType}-card`,
      href: buildRoute(collection, book.id),
      'data-book': book.id
    }, [
      Utils.createElement('div', { className: 'hadith-book-arabic' }, book.arabic),
      Utils.createElement('div', { className: 'hadith-book-name' }, book.name),
      book.totalHadiths ? Utils.createElement('div', { className: 'hadith-book-count' }, `${book.totalHadiths.toLocaleString()} hadiths`) : null,
      book.id === 'muslim' ? Utils.createElement('div', { className: 'hadith-book-info' }, 'Abdul Hamid Siddiqui numbering') : null
    ]);
  }

  return { getBaseRoute, buildRoute, getGradeInfo, getGradeClass, createHadithQuickJump, renderDashboard, createBookCard };
})();

window.HadithDashboard = HadithDashboard;
