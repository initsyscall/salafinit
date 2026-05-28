const HinduismView = (() => {
  async function render(container) {
    container.innerHTML = '';
    const page = Utils.createElement('div', { className: 'hinduism-page' });
    container.appendChild(page);

    const backBtn = Utils.createElement('button', {
      className: 'btn btn--ghost hinduism-back',
      onClick: () => window.location.hash = '#learn/other'
    }, [
      Utils.createElement('svg', { width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
        Utils.createElement('polyline', { points: '15 18 9 12 15 6' })
      ]),
      ' Back'
    ]);

    const header = Utils.createElement('div', { className: 'hinduism-header' }, [
      Utils.createElement('h1', { className: 'hinduism-title' }, 'Hinduism'),
      Utils.createElement('p', { className: 'hinduism-subtitle' }, 'Sacred texts of Sanatana Dharma — for comparative study')
    ]);
    page.appendChild(backBtn);
    page.appendChild(header);

    const jumpSection = QuickJump.create({
      id: 'hinduism',
      books: HinduismBooks.getAvailable(),
      routePrefix: '#learn/other/hinduism',
      getChapterInfo: null
    });
    page.appendChild(jumpSection);

    const sections = ['gita', 'vedas', 'epics'];
    sections.forEach(key => {
      const label = HinduismBooks.SECTION_LABELS[key];
      const books = HinduismBooks.getBySection(key);
      const group = createBookGroup(label.devanagari, label.name, books, key);
      page.appendChild(group);
    });
  }

  function createBookGroup(devanagariLabel, nameLabel, books) {
    const group = Utils.createElement('div', { className: 'hinduism-section' }, [
      Utils.createElement('h2', { className: 'hinduism-section-title' }, [
        Utils.createElement('span', { className: 'hinduism-section-devanagari' }, devanagariLabel),
        Utils.createElement('span', {}, ' — '),
        Utils.createElement('span', {}, nameLabel)
      ])
    ]);

    const grid = Utils.createElement('div', { className: 'hinduism-book-grid' });
    books.forEach(book => {
      const isActive = book.hasApi;
      const card = Utils.createElement(isActive ? 'a' : 'div', {
        className: `hinduism-book-card${isActive ? '' : ' hinduism-book-card--disabled'}`,
        ...(isActive ? { href: `#learn/other/hinduism/${book.id}` } : {})
      }, [
        Utils.createElement('div', { className: 'hinduism-book-name' }, book.name),
        Utils.createElement('div', { className: 'hinduism-book-devanagari' }, book.devanagari),
        Utils.createElement('div', { className: 'hinduism-book-chapters' }, isActive ? `${book.chapters} ${HinduismBooks.getBookConfig(book).chapterLabel}${book.chapters > 1 ? 's' : ''}` : 'Coming Soon')
      ]);
      grid.appendChild(card);
    });
    group.appendChild(grid);
    return group;
  }

  async function renderBook(container, params) {
    container.innerHTML = '';
    const page = Utils.createElement('div', { className: 'hinduism-page' });
    container.appendChild(page);

    const book = HinduismBooks.getById(params.book);
    if (!book) {
      page.innerHTML = '<div class="empty-state"><div class="empty-state__title">Text not found</div></div>';
      return;
    }

    const cfg = HinduismBooks.getBookConfig(book);
    const backLabel = book.section === 'gita' ? 'All Texts' : `All Texts`;

    const backBtn = Utils.createElement('button', {
      className: 'btn btn--ghost hinduism-back',
      onClick: () => { window.location.hash = '#learn/other/hinduism'; }
    }, [
      Utils.createElement('svg', { width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
        Utils.createElement('polyline', { points: '15 18 9 12 15 6' })
      ]),
      ` ${backLabel}`
    ]);

    const header = Utils.createElement('div', { className: 'hinduism-book-header' }, [
      Utils.createElement('h1', { className: 'hinduism-book-title' }, book.name),
      Utils.createElement('p', { className: 'hinduism-book-devanagari' }, book.devanagari),
      Utils.createElement('p', { className: 'hinduism-book-subtitle' }, `${book.chapters} ${cfg.chapterLabel}${book.chapters > 1 ? 's' : ''}`),
      Utils.createElement('p', { className: 'hinduism-book-ref' }, `Hinduism — ${HinduismBooks.SECTION_LABELS[book.section].name}`)
    ]);
    page.appendChild(backBtn);
    page.appendChild(header);

    const inputBox = Utils.createElement('div', { className: 'hinduism-chapter-input-box' }, [
      Utils.createElement('p', { className: 'hinduism-chapter-label' }, `Enter a ${cfg.chapterLabel.toLowerCase()} number to read:`),
      Utils.createElement('div', { className: 'hinduism-chapter-row' }, [
        Utils.createElement('input', {
          type: 'number',
          min: '1',
          max: book.chapters,
          className: 'input hinduism-chapter-input',
          id: 'hinduism-chapter-input',
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
      const ch = document.getElementById('hinduism-chapter-input').value;
      if (ch) {
        window.location.hash = `#learn/other/hinduism/${book.id}/${ch}`;
      }
    }
  }

  async function renderChapter(container, params) {
    container.innerHTML = '';
    const page = Utils.createElement('div', { className: 'hinduism-page' });
    container.appendChild(page);

    const book = HinduismBooks.getById(params.book);
    if (!book) {
      page.innerHTML = '<div class="empty-state"><div class="empty-state__title">Text not found</div></div>';
      return;
    }

    const chapterNum = parseInt(params.chapter);
    if (isNaN(chapterNum) || chapterNum < 1 || chapterNum > book.chapters) {
      page.innerHTML = '<div class="empty-state"><div class="empty-state__title">Chapter not found</div></div>';
      return;
    }

    const cfg = HinduismBooks.getBookConfig(book);
    const subNum = params.verse ? parseInt(params.verse) : null;

    const loading = Utils.createElement('div', { className: 'hinduism-loading' }, 'Loading...');
    page.appendChild(loading);

    try {
      const data = await HinduismBooks.fetchChapterData(book.id, chapterNum, subNum);
      if (!data || data.length === 0) {
        loading.remove();
        const err = Utils.createElement('div', { className: 'empty-state' }, [
          Utils.createElement('div', { className: 'empty-state__title' }, 'No content found'),
          Utils.createElement('p', { className: 'empty-state__description' }, 'Please check the reference and try again.')
        ]);
        page.appendChild(err);
        return;
      }

      loading.remove();
      page.innerHTML = '';

      const backBtn = Utils.createElement('button', {
        className: 'btn btn--ghost hinduism-back',
        onClick: () => { window.location.hash = `#learn/other/hinduism/${book.id}`; }
      }, [
        Utils.createElement('svg', { width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
          Utils.createElement('polyline', { points: '15 18 9 12 15 6' })
        ]),
        ` ${book.name}`
      ]);
      page.appendChild(backBtn);

      if (data[0] && data[0].isChapter) {
        renderChapterTOC(page, book, cfg, chapterNum, data);
      } else {
        renderVerses(page, book, cfg, chapterNum, data, subNum);
      }
    } catch (e) {
      loading.remove();
      const err = Utils.createElement('div', { className: 'empty-state' }, [
        Utils.createElement('div', { className: 'empty-state__title' }, 'Failed to load'),
        Utils.createElement('p', { className: 'empty-state__description' }, 'Please check your internet connection and try again.')
      ]);
      page.appendChild(err);
    }
  }

  function renderChapterTOC(page, book, cfg, chapterNum, chapters) {
    const header = Utils.createElement('div', { className: 'hinduism-chapter-header' }, [
      Utils.createElement('h1', { className: 'hinduism-chapter-title' }, `${book.name} — ${cfg.chapterLabel} ${chapterNum}`),
      Utils.createElement('p', { className: 'hinduism-chapter-translation' }, `Select a ${cfg.verseLabel.toLowerCase()} to read`)
    ]);
    page.appendChild(header);

    const grid = Utils.createElement('div', { className: 'hinduism-book-grid' });
    chapters.forEach(ch => {
      const card = Utils.createElement('a', {
        className: 'hinduism-book-card',
        href: `#learn/other/hinduism/${book.id}/${chapterNum}/${ch.number}`
      }, [
        Utils.createElement('div', { className: 'hinduism-book-name' }, `${cfg.verseLabel} ${ch.number}`),
        Utils.createElement('div', { className: 'hinduism-book-chapters' }, `${ch.verseCount} verses`)
      ]);
      grid.appendChild(card);
    });
    page.appendChild(grid);
  }

  function renderVerses(page, book, cfg, chapterNum, verses, subNum) {
    const header = Utils.createElement('div', { className: 'hinduism-chapter-header' }, [
      Utils.createElement('h1', { className: 'hinduism-chapter-title' }, subNum
        ? `${book.name} — ${cfg.chapterLabel} ${chapterNum}, ${cfg.verseLabel} ${subNum}`
        : `${book.name} — ${cfg.chapterLabel} ${chapterNum}`),
      Utils.createElement('p', { className: 'hinduism-chapter-translation' }, book.name)
    ]);
    page.appendChild(header);

    const isGita = book.id === 'bhagavad-gita';

    verses.forEach((v, i) => {
      const verseNum = v.number;
      const card = Utils.createElement('div', {
        className: 'hinduism-verse-card',
        id: `hverse-${book.id}-${chapterNum}-${verseNum}`
      }, [
        Utils.createElement('div', { className: 'hinduism-verse-header' }, [
          Utils.createElement('div', { className: 'hinduism-verse-left' }, [
            Utils.createElement('span', { className: 'hinduism-verse-num' }, `${verseNum}`),
            Utils.createElement('span', { className: 'hinduism-verse-ref' }, v.sarga ? `${v.sarga}:${verseNum}` : `${chapterNum}:${verseNum}`)
          ])
        ]),
        v.transliteration ? Utils.createElement('div', { className: 'hinduism-verse-transliteration' }, v.transliteration) : null,
        Utils.createElement('div', { className: 'hinduism-verse-text' }, v.text),
        v.meaning ? Utils.createElement('div', { className: 'hinduism-verse-meaning' }, `— ${v.meaning}`) : null,
        Utils.createElement('div', { className: 'hinduism-verse-actions hinduism-card-exclude' }, [
          Utils.createElement('button', {
            className: 'btn hinduism-action-btn',
            title: 'Copy',
            onClick: (e) => copyVerse(book, chapterNum, v, e.currentTarget),
            innerHTML: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>'
          }),
          Utils.createElement('button', {
            className: 'btn hinduism-action-btn',
            title: 'Share Image',
            onClick: () => shareVerseImage(book, chapterNum, verseNum),
            innerHTML: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>'
          }),
          Utils.createElement('button', {
            className: 'btn hinduism-action-btn',
            title: 'Copy Link',
            onClick: (e) => Share.copyLink(`#learn/other/hinduism/${book.id}/${chapterNum}/${verseNum}`, { btn: e.currentTarget }),
            innerHTML: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>'
          }),
          Utils.createElement('button', {
            className: 'btn hinduism-action-btn',
            title: 'Translate',
            onClick: () => TranslationModule.translateText(v.text),
            innerHTML: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>'
          })
        ])
      ]);
      page.appendChild(card);
    });

    if (!subNum || (cfg.type === 'book-with-chapters' && book.id !== 'bhagavad-gita')) {
      const nav = Utils.createElement('div', { className: 'hinduism-chapter-nav' });
      if (chapterNum > 1) {
        nav.appendChild(Utils.createElement('a', {
          className: 'btn btn--ghost',
          href: `#learn/other/hinduism/${book.id}/${chapterNum - 1}`
        }, `‹ Previous ${cfg.chapterLabel}`));
      } else {
        nav.appendChild(Utils.createElement('span'));
      }
      if (chapterNum < book.chapters) {
        nav.appendChild(Utils.createElement('a', {
          className: 'btn btn--ghost',
          href: `#learn/other/hinduism/${book.id}/${chapterNum + 1}`
        }, `Next ${cfg.chapterLabel} ›`));
      }
      page.appendChild(nav);
    }

    page.appendChild(Utils.createElement('button', {
      className: 'scroll-to-top',
      innerHTML: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="18 15 12 9 6 15"></polyline></svg>',
      onClick: () => window.scrollTo({ top: 0, behavior: 'smooth' })
    }));

    if (params.verse && !subNum) {
      const target = document.getElementById(`hverse-${book.id}-${chapterNum}-${params.verse}`);
      if (target) {
        target.classList.add('hinduism-verse-card--highlight');
        setTimeout(() => target.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
      }
    }
  }

  function copyVerse(book, chapterNum, verse, btn) {
    const ref = book.id === 'bhagavad-gita' ? `— ${book.name} ${chapterNum}:${verse.number}` : `${book.name} ${chapterNum}:${verse.number}`;
    const text = `${verse.text}\n\n${ref}`;
    Share.copyText(text, { btn, toast: '' });
  }

  async function shareVerseImage(book, chapterNum, verseNum) {
    const card = document.getElementById(`hverse-${book.id}-${chapterNum}-${verseNum}`);
    if (!card) return;
    await Share.captureImage(card, `hinduism-${book.id}-${chapterNum}-${verseNum}.png`, {
      captureClass: 'hinduism-capturing'
    });
  }

  return { render, renderBook, renderChapter };
})();

window.HinduismView = HinduismView;
