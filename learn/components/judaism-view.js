const JudaismView = (() => {
  const API_BASE = 'https://bible-api.com';

  async function render(container) {
    container.innerHTML = '';
    const page = Utils.createElement('div', { className: 'judaism-page' });
    container.appendChild(page);

    const backBtn = Utils.createElement('button', {
      className: 'btn btn--ghost judaism-back',
      onClick: () => window.location.hash = '#learn/other'
    }, [
      Utils.createElement('svg', { width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
        Utils.createElement('polyline', { points: '15 18 9 12 15 6' })
      ]),
      ' Back'
    ]);

    const header = Utils.createElement('div', { className: 'judaism-header' }, [
      Utils.createElement('h1', { className: 'judaism-title' }, 'Judaism'),
      Utils.createElement('p', { className: 'judaism-subtitle' }, 'Tanakh — Jewish Publication Society (JPS) translation')
    ]);
    page.appendChild(backBtn);
    page.appendChild(header);

    const jumpSection = QuickJump.create({
      id: 'judaism',
      books: JudaismBooks.getAll(),
      routePrefix: '#learn/other/judaism',
      getChapterInfo: async (bookId, chapter) => {
        const book = JudaismBooks.getById(bookId);
        if (!book) return null;
        const apiName = book.name.toLowerCase().replace(/\s+/g, '+');
        const data = await ApiClient.fetchApi(`${API_BASE}/${apiName}+${chapter}`);
        return { verseCount: (data.verses || []).length };
      }
    });
    page.appendChild(jumpSection);

    const sections = ['torah', 'neviim', 'ketuvim'];
    sections.forEach(key => {
      const label = JudaismBooks.SECTION_LABELS[key];
      const books = JudaismBooks.getBySection(key);
      const group = createBookGroup(label.hebrew, label.name, books, key);
      page.appendChild(group);
    });
  }

  function createBookGroup(hebrewLabel, nameLabel, books, sectionKey) {
    const group = Utils.createElement('div', { className: 'judaism-section' }, [
      Utils.createElement('h2', { className: 'judaism-section-title' }, [
        Utils.createElement('span', { className: 'judaism-section-hebrew' }, hebrewLabel),
        Utils.createElement('span', {}, ' — '),
        Utils.createElement('span', {}, nameLabel)
      ])
    ]);

    const grid = Utils.createElement('div', { className: 'judaism-book-grid' });
    books.forEach(book => {
      const card = Utils.createElement('a', {
        className: 'judaism-book-card',
        href: `#learn/other/judaism/${book.id}`
      }, [
        Utils.createElement('div', { className: 'judaism-book-name' }, book.name),
        Utils.createElement('div', { className: 'judaism-book-hebrew' }, book.hebrew),
        Utils.createElement('div', { className: 'judaism-book-chapters' }, `${book.chapters} chapters`)
      ]);
      grid.appendChild(card);
    });
    group.appendChild(grid);
    return group;
  }

  async function renderBook(container, params) {
    container.innerHTML = '';
    const page = Utils.createElement('div', { className: 'judaism-page' });
    container.appendChild(page);

    const book = JudaismBooks.getById(params.book);
    if (!book) {
      page.innerHTML = '<div class="empty-state"><div class="empty-state__title">Book not found</div></div>';
      return;
    }

    const backBtn = Utils.createElement('button', {
      className: 'btn btn--ghost judaism-back',
      onClick: () => { window.location.hash = '#learn/other/judaism'; }
    }, [
      Utils.createElement('svg', { width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
        Utils.createElement('polyline', { points: '15 18 9 12 15 6' })
      ]),
      ' All Books'
    ]);

    const header = Utils.createElement('div', { className: 'judaism-book-header' }, [
      Utils.createElement('h1', { className: 'judaism-book-title' }, book.name),
      Utils.createElement('p', { className: 'judaism-book-hebrew' }, book.hebrew),
      Utils.createElement('p', { className: 'judaism-book-subtitle' }, `${book.chapters} chapters`),
      Utils.createElement('p', { className: 'judaism-book-ref' }, `Tanakh — ${JudaismBooks.SECTION_LABELS[book.section].name}`)
    ]);
    page.appendChild(backBtn);
    page.appendChild(header);

    const inputBox = Utils.createElement('div', { className: 'judaism-chapter-input-box' }, [
      Utils.createElement('p', { className: 'judaism-chapter-label' }, 'Enter a chapter number to read:'),
      Utils.createElement('div', { className: 'judaism-chapter-row' }, [
        Utils.createElement('input', {
          type: 'number',
          min: '1',
          max: book.chapters,
          className: 'input judaism-chapter-input',
          id: 'judaism-chapter-input',
          placeholder: `1 – ${book.chapters}`,
          onKeydown: (e) => { if (e.key === 'Enter') goToChapter(); }
        }),
        Utils.createElement('button', {
          className: 'btn btn--ghost',
          onClick: goToChapter
        }, 'Read')
      ])
    ]);
    page.appendChild(inputBox);

    function goToChapter() {
      const ch = document.getElementById('judaism-chapter-input').value;
      if (ch) {
        window.location.hash = `#learn/other/judaism/${book.id}/${ch}`;
      }
    }
  }

  async function renderChapter(container, params) {
    container.innerHTML = '';
    const page = Utils.createElement('div', { className: 'judaism-page' });
    container.appendChild(page);

    const book = JudaismBooks.getById(params.book);
    if (!book) {
      page.innerHTML = '<div class="empty-state"><div class="empty-state__title">Book not found</div></div>';
      return;
    }

    const chapterNum = parseInt(params.chapter);
    if (isNaN(chapterNum) || chapterNum < 1 || chapterNum > book.chapters) {
      page.innerHTML = '<div class="empty-state"><div class="empty-state__title">Chapter not found</div></div>';
      return;
    }

    const loading = Utils.createElement('div', { className: 'judaism-loading' }, 'Loading chapter...');
    page.appendChild(loading);

    try {
      const apiName = book.name.toLowerCase().replace(/\s+/g, '+');
      const data = await ApiClient.fetchApi(`${API_BASE}/${apiName}+${chapterNum}`);

      page.innerHTML = '';

      const backBtn = Utils.createElement('button', {
        className: 'btn btn--ghost judaism-back',
        onClick: () => { window.location.hash = `#learn/other/judaism/${book.id}`; }
      }, [
        Utils.createElement('svg', { width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
          Utils.createElement('polyline', { points: '15 18 9 12 15 6' })
        ]),
        ` ${book.name}`
      ]);
      page.appendChild(backBtn);

      const header = Utils.createElement('div', { className: 'judaism-chapter-header' }, [
        Utils.createElement('h1', { className: 'judaism-chapter-title' }, `${book.name} ${chapterNum}`),
        Utils.createElement('p', { className: 'judaism-chapter-translation' }, 'Jewish Publication Society (JPS)')
      ]);
      page.appendChild(header);

      (data.verses || []).forEach(v => {
        const card = Utils.createElement('div', {
          className: 'judaism-verse-card',
          id: `jverse-${book.id}-${chapterNum}-${v.verse}`
        }, [
          Utils.createElement('div', { className: 'judaism-verse-header' }, [
            Utils.createElement('div', { className: 'judaism-verse-left' }, [
              Utils.createElement('span', { className: 'judaism-verse-num' }, `${v.verse}`),
              Utils.createElement('span', { className: 'judaism-verse-ref' }, `${book.hebrew} ${chapterNum}`)
            ])
          ]),
          Utils.createElement('div', { className: 'judaism-verse-text' }, v.text),
          Utils.createElement('div', { className: 'judaism-verse-actions judaism-card-exclude' }, [
            Utils.createElement('button', {
              className: 'btn judaism-action-btn',
              title: 'Copy',
              onClick: (e) => copyVerse(v, book, chapterNum, e.currentTarget),
              innerHTML: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>'
            }),
            Utils.createElement('button', {
              className: 'btn judaism-action-btn',
              title: 'Share Image',
              onClick: () => shareVerseImage(v, book, chapterNum),
              innerHTML: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>'
            }),
            Utils.createElement('button', {
              className: 'btn judaism-action-btn',
              title: 'Copy Link',
              onClick: (e) => Share.copyLink(`#learn/other/judaism/${book.id}/${chapterNum}/${v.verse}`, { btn: e.currentTarget }),
              innerHTML: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>'
            })
          ])
        ]);
        page.appendChild(card);
      });

      const nav = Utils.createElement('div', { className: 'judaism-chapter-nav' });
      if (chapterNum > 1) {
        nav.appendChild(Utils.createElement('a', {
          className: 'btn btn--ghost',
          href: `#learn/other/judaism/${book.id}/${chapterNum - 1}`
        }, '‹ Previous Chapter'));
      } else {
        nav.appendChild(Utils.createElement('span'));
      }
      if (chapterNum < book.chapters) {
        nav.appendChild(Utils.createElement('a', {
          className: 'btn btn--ghost',
          href: `#learn/other/judaism/${book.id}/${chapterNum + 1}`
        }, 'Next Chapter ›'));
      }
      page.appendChild(nav);

      page.appendChild(Utils.createElement('button', {
        className: 'scroll-to-top',
        innerHTML: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="18 15 12 9 6 15"></polyline></svg>',
        onClick: () => window.scrollTo({ top: 0, behavior: 'smooth' })
      }));

      if (params.verse) {
        const verseNum = parseInt(params.verse);
        if (!isNaN(verseNum)) {
          const target = document.getElementById(`jverse-${book.id}-${chapterNum}-${verseNum}`);
          if (target) {
            target.classList.add('judaism-verse-card--highlight');
            setTimeout(() => target.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
          }
        }
      }
    } catch (e) {
      loading.remove();
      const error = Utils.createElement('div', { className: 'empty-state' }, [
        Utils.createElement('div', { className: 'empty-state__title' }, 'Failed to load chapter'),
        Utils.createElement('p', { className: 'empty-state__description' }, 'Please check your internet connection and try again.')
      ]);
      page.appendChild(error);
    }
  }

  function copyVerse(verse, book, chapterNum, btn) {
    const url = `${window.location.origin}${window.location.pathname}#learn/other/judaism/${book.id}/${chapterNum}/${verse.verse}`;
    const text = `${book.name} ${chapterNum}:${verse.verse}\n\n${verse.text}\n\nJPS Translation\n\nLink: ${url}`;
    Share.copyText(text, { btn, toast: '' });
  }

  async function shareVerseImage(verse, book, chapterNum) {
    const card = document.getElementById(`jverse-${book.id}-${chapterNum}-${verse.verse}`);
    if (!card) return;
    await Share.captureImage(card, `judaism-${book.id}-${chapterNum}-${verse.verse}.png`, {
      captureClass: 'judaism-capturing'
    });
  }

  return { render, renderBook, renderChapter };
})();

window.JudaismView = JudaismView;
