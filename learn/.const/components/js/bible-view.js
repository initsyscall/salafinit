const BibleView = (() => {
  const API_BASE = 'https://bible-api.com';

  async function render(container) {
    container.innerHTML = '';
    const page = Utils.createElement('div', { className: 'bible-page' });
    container.appendChild(page);
    renderBookList(page);
  }

  function renderBookList(container) {
    const backBtn = Utils.createElement('button', {
      className: 'btn btn--ghost bible-back',
      onClick: () => window.location.hash = '#learn/other'
    }, [
      Utils.createElement('svg', { width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
        Utils.createElement('polyline', { points: '15 18 9 12 15 6' })
      ]),
      ' Back'
    ]);

    const header = Utils.createElement('div', { className: 'bible-header' }, [
      Utils.createElement('h1', { className: 'bible-title' }, 'Bible'),
      Utils.createElement('p', { className: 'bible-subtitle' }, 'World English Bible — For comparative study')
    ]);

    const jumpSection = createQuickJump();
    const otGroup = createTestamentGroup('Old Testament', 'الْعَهْدُ الْقَدِيمُ', BibleBooks.getOT());
    const ntGroup = createTestamentGroup('New Testament', 'الْعَهْدُ الْجَدِيدُ', BibleBooks.getNT());

    container.appendChild(backBtn);
    container.appendChild(header);
    container.appendChild(jumpSection);
    container.appendChild(otGroup);
    container.appendChild(ntGroup);
  }

  function createTestamentGroup(title, arabic, books) {
    const group = Utils.createElement('div', { className: 'bible-testament' }, [
      Utils.createElement('h2', { className: 'bible-testament-title' }, [
        Utils.createElement('span', { className: 'bible-testament-arabic' }, arabic),
        Utils.createElement('span', {}, ' — '),
        Utils.createElement('span', {}, title)
      ])
    ]);

    const grid = Utils.createElement('div', { className: 'bible-book-grid' });
    books.forEach(book => {
      const card = Utils.createElement('a', {
        className: 'bible-book-card',
        href: `#learn/other/bible/${book.id}`
      }, [
        Utils.createElement('div', { className: 'bible-book-name' }, book.name),
        Utils.createElement('div', { className: 'bible-book-chapters' }, `${book.chapters} chapters`)
      ]);
      grid.appendChild(card);
    });
    group.appendChild(grid);
    return group;
  }

  function createQuickJump() {
    const allBooks = BibleBooks.getAll();

    const bookOpts = [
      Utils.createElement('option', { value: '', textContent: '— Book —' }),
      ...allBooks.map(b => Utils.createElement('option', {
        value: b.id,
        textContent: b.name
      }))
    ];

    const section = Utils.createElement('div', { className: 'bible-jump' }, [
      Utils.createElement('h2', { className: 'bible-jump-title' }, 'Quick Jump'),
      Utils.createElement('div', { className: 'bible-jump-row' }, [
        Utils.createElement('select', {
          className: 'input bible-jump-select',
          id: 'bible-jump-book',
          onChange: onBookChange
        }, bookOpts),
        Utils.createElement('input', {
          type: 'number',
          min: '1',
          className: 'input bible-jump-input',
          id: 'bible-jump-chapter',
          placeholder: 'Chapter',
          onKeydown: (e) => { if (e.key === 'Enter') onGo(); },
          onChange: onChapterChange
        }),
        Utils.createElement('input', {
          type: 'number',
          min: '1',
          className: 'input bible-jump-input',
          id: 'bible-jump-verse',
          placeholder: 'Verse',
          onKeydown: (e) => { if (e.key === 'Enter') onGo(); }
        }),
        Utils.createElement('button', {
          className: 'btn btn--ghost',
          id: 'bible-jump-go',
          onClick: onGo
        }, 'Go')
      ]),
    ]);

    function onBookChange() {
      const bookId = document.getElementById('bible-jump-book').value;
      const chInput = document.getElementById('bible-jump-chapter');
      const vInput = document.getElementById('bible-jump-verse');
      chInput.value = '';
      vInput.value = '';
      vInput.removeAttribute('max');
      vInput.placeholder = 'Verse';
      if (bookId) {
        const book = BibleBooks.getById(bookId);
        chInput.max = book.chapters;
        chInput.placeholder = `1 – ${book.chapters}`;
      } else {
        chInput.removeAttribute('max');
        chInput.placeholder = 'Chapter';
      }
    }

    async function onChapterChange() {
      const bookId = document.getElementById('bible-jump-book').value;
      const ch = parseInt(document.getElementById('bible-jump-chapter').value);
      const vInput = document.getElementById('bible-jump-verse');
      vInput.value = '';
      vInput.removeAttribute('max');

      if (!bookId || !ch) return;

      const book = BibleBooks.getById(bookId);
      if (ch > book.chapters) return;

      try {
        const apiName = BibleBooks.toApiName(book);
        const data = await ApiClient.fetchApi(`${API_BASE}/${apiName}+${ch}`);
        const count = (data.verses || []).length;
        if (count) {
          vInput.max = count;
          vInput.placeholder = `1 – ${count}`;
        }
      } catch (e) { /* verse range unavailable */ }
    }

    function onGo() {
      const bookId = document.getElementById('bible-jump-book').value;
      const ch = parseInt(document.getElementById('bible-jump-chapter').value);
      const verse = document.getElementById('bible-jump-verse').value;
      if (bookId && ch > 0) {
        const book = BibleBooks.getById(bookId);
        if (ch > book.chapters) return;
        window.location.hash = verse ? `#learn/other/bible/${bookId}/${ch}/${verse}` : `#learn/other/bible/${bookId}/${ch}`;
      }
    }

    return section;
  }

  async function renderBook(container, params) {
    container.innerHTML = '';
    const page = Utils.createElement('div', { className: 'bible-page' });
    container.appendChild(page);

    const book = BibleBooks.getById(params.book);
    if (!book) {
      page.innerHTML = '<div class="empty-state"><div class="empty-state__title">Book not found</div></div>';
      return;
    }

    const backBtn = Utils.createElement('button', {
      className: 'btn btn--ghost bible-back',
      onClick: () => { window.location.hash = '#learn/other/bible'; }
    }, [
      Utils.createElement('svg', { width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
        Utils.createElement('polyline', { points: '15 18 9 12 15 6' })
      ]),
      ' All Books'
    ]);

    const header = Utils.createElement('div', { className: 'bible-book-header' }, [
      Utils.createElement('h1', { className: 'bible-book-title' }, book.name),
      Utils.createElement('p', { className: 'bible-book-arabic' }, book.arabic),
      Utils.createElement('p', { className: 'bible-book-subtitle' }, `${book.chapters} chapters — ${book.testament === 'ot' ? 'Old Testament' : 'New Testament'}`)
    ]);
    page.appendChild(backBtn);
    page.appendChild(header);

    const inputBox = Utils.createElement('div', { className: 'bible-chapter-input-box' }, [
      Utils.createElement('p', { className: 'bible-chapter-label' }, 'Enter a chapter number to read:'),
      Utils.createElement('div', { className: 'bible-chapter-row' }, [
        Utils.createElement('input', {
          type: 'number',
          min: '1',
          max: book.chapters,
          className: 'input bible-chapter-input',
          id: 'bible-chapter-input',
          placeholder: `1 – ${book.chapters}`,
          onKeydown: (e) => {
            if (e.key === 'Enter') goToChapter();
          }
        }),
        Utils.createElement('button', {
          className: 'btn btn--ghost',
          onClick: goToChapter
        }, 'Read')
      ])
    ]);
    page.appendChild(inputBox);

    function goToChapter() {
      const ch = document.getElementById('bible-chapter-input').value;
      if (ch) {
        window.location.hash = `#learn/other/bible/${book.id}/${ch}`;
      }
    }
  }

  async function renderChapter(container, params) {
    container.innerHTML = '';
    const page = Utils.createElement('div', { className: 'bible-page' });
    container.appendChild(page);

    const book = BibleBooks.getById(params.book);
    if (!book) {
      page.innerHTML = '<div class="empty-state"><div class="empty-state__title">Book not found</div></div>';
      return;
    }

    const chapterNum = parseInt(params.chapter);
    if (isNaN(chapterNum) || chapterNum < 1 || chapterNum > book.chapters) {
      page.innerHTML = '<div class="empty-state"><div class="empty-state__title">Chapter not found</div></div>';
      return;
    }

    const loading = Utils.createElement('div', { className: 'bible-loading' }, 'Loading chapter...');
    page.appendChild(loading);

    try {
      const apiName = BibleBooks.toApiName(book);
      const url = `${API_BASE}/${apiName}+${chapterNum}`;
      const data = await ApiClient.fetchApi(url);

      page.innerHTML = '';

      const backBtn = Utils.createElement('button', {
        className: 'btn btn--ghost bible-back',
        onClick: () => { window.location.hash = `#learn/other/bible/${book.id}`; }
      }, [
        Utils.createElement('svg', { width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
          Utils.createElement('polyline', { points: '15 18 9 12 15 6' })
        ]),
        ` ${book.name}`
      ]);
      page.appendChild(backBtn);

      const header = Utils.createElement('div', { className: 'bible-chapter-header' }, [
        Utils.createElement('h1', { className: 'bible-chapter-title' }, `${book.name} ${chapterNum}`),
        Utils.createElement('p', { className: 'bible-chapter-translation' }, 'World English Bible')
      ]);
      page.appendChild(header);

      (data.verses || []).forEach(v => {
        const card = Utils.createElement('div', {
          className: 'bible-verse-card',
          id: `verse-${book.id}-${chapterNum}-${v.verse}`
        }, [
          Utils.createElement('div', { className: 'bible-verse-header' }, [
            Utils.createElement('div', { className: 'bible-verse-left' }, [
              Utils.createElement('span', { className: 'bible-verse-num' }, `${v.verse}`),
              Utils.createElement('span', { className: 'bible-verse-ref' }, `${book.name} ${chapterNum}`)
            ])
          ]),
          Utils.createElement('div', { className: 'bible-verse-text' }, v.text),
          Utils.createElement('div', { className: 'bible-verse-actions bible-card-exclude' }, [
            Utils.createElement('button', {
              className: 'btn bible-action-btn',
              title: 'Copy',
              onClick: () => copyVerse(v, book, chapterNum),
              innerHTML: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>'
            }),
            Utils.createElement('button', {
              className: 'btn bible-action-btn',
              title: 'Share Image',
              onClick: () => shareVerseImage(v, book, chapterNum),
              innerHTML: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>'
            }),
            Utils.createElement('button', {
              className: 'btn bible-action-btn',
              title: 'Copy Link',
              onClick: () => copyVerseLink(v, book, chapterNum),
              innerHTML: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>'
            })
          ])
        ]);
        page.appendChild(card);
      });

      const nav = Utils.createElement('div', { className: 'bible-chapter-nav' });
      if (chapterNum > 1) {
        const prev = Utils.createElement('a', {
          className: 'btn btn--ghost',
          href: `#learn/other/bible/${book.id}/${chapterNum - 1}`
        }, '‹ Previous Chapter');
        nav.appendChild(prev);
      } else {
        nav.appendChild(Utils.createElement('span'));
      }
      if (chapterNum < book.chapters) {
        const next = Utils.createElement('a', {
          className: 'btn btn--ghost',
          href: `#learn/other/bible/${book.id}/${chapterNum + 1}`
        }, 'Next Chapter ›');
        nav.appendChild(next);
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
          const target = document.getElementById(`verse-${book.id}-${chapterNum}-${verseNum}`);
          if (target) {
            target.classList.add('bible-verse-card--highlight');
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

  function copyVerse(verse, book, chapterNum) {
    const url = `${window.location.origin}${window.location.pathname}#learn/other/bible/${book.id}/${chapterNum}/${verse.verse}`;
    const text = `${book.name} ${chapterNum}:${verse.verse}\n\n${verse.text}\n\nWorld English Bible (WEB)\n\nLink: ${url}`;
    navigator.clipboard.writeText(text).then(() => {
      const btns = document.querySelectorAll('.bible-action-btn');
      if (btns[0]) {
        const orig = btns[0].innerHTML;
        btns[0].innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>';
        setTimeout(() => { btns[0].innerHTML = orig; }, 2000);
      }
    });
  }

  async function shareVerseImage(verse, book, chapterNum) {
    const cardId = `verse-${book.id}-${chapterNum}-${verse.verse}`;
    const card = document.getElementById(cardId);
    if (!card) return;

    try {
      if (typeof snapdom !== 'undefined') {
        document.getSelection()?.removeAllRanges();
        card.classList.add('bible-capturing');
        const img = await snapdom.toPng(card, { scale: 2 });
        card.classList.remove('bible-capturing');
        const a = document.createElement('a');
        a.href = img.src;
        a.download = `bible-${book.id}-${chapterNum}-${verse.verse}.png`;
        a.click();
        Utils.showToast('Image downloaded!');
      }
    } catch (err) {
      console.error('Share image error:', err);
      Utils.showToast('Failed to generate image');
    }
  }

  function copyVerseLink(verse, book, chapterNum) {
    const url = `${window.location.origin}${window.location.pathname}#learn/other/bible/${book.id}/${chapterNum}/${verse.verse}`;
    navigator.clipboard.writeText(url).then(() => {
      const btns = document.querySelectorAll('.bible-action-btn');
      if (btns[2]) {
        const orig = btns[2].innerHTML;
        btns[2].innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>';
        setTimeout(() => { btns[2].innerHTML = orig; }, 2000);
      }
    });
  }

  return { render, renderBook, renderChapter };
})();

window.BibleView = BibleView;
