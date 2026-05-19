const HadithView = (() => {
  let currentCollection = 'sunni';
  let currentBook = null;
  let currentChapter = null;

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

  async function render(container, params = {}) {
    container.innerHTML = '';
    const content = Utils.createElement('div', { className: 'hadith-page' });
    container.appendChild(content);

    const collection = HadithApi.normalizeCollection(params.collection);
    currentCollection = collection;

    if (params.book && params.hadith) {
      await renderHadithDetail(content, collection, params.book, params.hadith);
    } else if (params.book) {
      await renderBookInput(content, collection, params.book);
    } else {
      renderDashboard(content, collection);
    }
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
          'font-size': '40',
          fill: '#A277FF'
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

    const searchSection = Utils.createElement('div', { className: 'hadith-search-hero' }, [
      Utils.createElement('select', {
        className: 'input hadith-book-select',
        id: 'hadith-book-dropdown'
      }, [
        Utils.createElement('option', { value: '', textContent: '— Select a Book —' }),
        ...displayBooks.map(b => Utils.createElement('option', {
          value: `${collection}|${b.id}`,
          textContent: `${b.name} (${b.arabic})`
        }))
      ]),
      Utils.createElement('button', {
        className: 'btn btn--primary hadith-search-btn',
        onClick: () => {
          const selected = document.getElementById('hadith-book-dropdown').value;
          if (selected) {
            const [collection, bookId] = selected.split('|');
            window.location.hash = buildRoute(collection, bookId);
          }
        }
      }, 'Go')
    ]);
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
      book.totalHadiths ? Utils.createElement('div', { className: 'hadith-book-count' }, `${book.totalHadiths.toLocaleString()} hadiths`) : null
    ]);
  }

  async function renderBookInput(container, collection, bookId) {
    const backHref = collection === 'shia' ? '#learn/shia' : '#hadiths';
    const backBtn = Utils.createElement('a', {
      href: backHref,
      className: 'hadith-back-btn'
    }, '← Back to Dashboard');
    container.appendChild(backBtn);

    const { sunni, shia } = HadithApi.getAllBooks();
    const allBooks = [...sunni, ...shia];
    const book = allBooks.find(b => b.id === bookId);

    const header = Utils.createElement('div', { className: 'hadith-book-header' }, [
      Utils.createElement('h1', { className: 'hadith-book-title' }, book?.name || bookId),
      Utils.createElement('p', { className: 'hadith-book-arabic-title' }, book?.arabic || '')
    ]);
    container.appendChild(header);

    const navSection = Utils.createElement('div', { className: 'hadith-search-box' }, [
      Utils.createElement('p', { className: 'hadith-search-label' }, 'Enter a hadith number to view:'),
      Utils.createElement('div', { className: 'hadith-search-row' }, [
        Utils.createElement('input', {
          type: 'number',
          min: '1',
          max: book?.totalHadiths || 9999,
          className: 'input hadith-search-input',
          id: 'hadith-input',
          placeholder: `e.g. 1 - ${book?.totalHadiths || 735}`,
          onKeydown: (e) => {
            if (e.key === 'Enter') {
              const h = document.getElementById('hadith-input').value;
              if (h) window.location.hash = buildRoute(collection, bookId, h);
            }
          }
        }),
        Utils.createElement('button', {
          className: 'btn btn--primary hadith-search-btn',
          onClick: () => {
            const h = document.getElementById('hadith-input').value;
            if (h) window.location.hash = buildRoute(collection, bookId, h);
          }
        }, 'View')
      ])
    ]);
    container.appendChild(navSection);

    const collectionInfo = collection === 'shia'
      ? { title: 'Shia Hadith Collection', desc: '8 volumes of Al-Kafi plus Al-Amali, Al-Khisal, Al-Tawhid, Kitab al-Ghayba, Ma\'ani al-Akhbar, and Uyun al-Rida.' }
      : { title: 'Salafi (Sunni) Hadith Collection', desc: 'Kutub al-Sittah (6 books) + Musnad Ahmad, Muwatta Malik, Al-Adab Al-Mufrod, Mishkat al-Masabih, Riyadh as-Salihin, and more.' };

    const descSection = Utils.createElement('div', { className: 'hadith-collection-desc' }, [
      Utils.createElement('h3', { className: 'hadith-collection-title' }, collectionInfo.title),
      Utils.createElement('p', { className: 'hadith-collection-text' }, collectionInfo.desc)
    ]);
    container.appendChild(descSection);
  }

  async function renderChapterHadiths(container, collection, bookId, chapter) {
    const backBtn = Utils.createElement('a', {
      href: buildRoute(collection, bookId),
      className: 'hadith-back-btn'
    }, '← Back to Chapters');
    container.appendChild(backBtn);

    const header = Utils.createElement('div', { className: 'hadith-chapter-header' }, [
      Utils.createElement('h1', { className: 'hadith-chapter-title' }, `Chapter ${chapter}`)
    ]);
    container.appendChild(header);

    const loader = Utils.createElement('div', { className: 'loader' }, [
      Utils.createElement('div', { className: 'loader__spinner' }),
      Utils.createElement('span', { className: 'loader__text' }, 'Loading hadiths...')
    ]);
    container.appendChild(loader);

    try {
      const rawData = await HadithApi.getChapterHadiths(collection, bookId, chapter);
      loader.remove();

      const hadiths = Array.isArray(rawData) ? rawData : (rawData?.hadiths || []);
      const hadithsGrid = Utils.createElement('div', { className: 'hadiths-mini-list' });

      if (hadiths.length > 0) {
        hadiths.forEach(h => {
          const grade = h.grade || 'Unknown';
          const gradeClass = getGradeClass(grade);

          const miniCard = Utils.createElement('a', {
            href: buildRoute(collection, bookId, h.idInBook || h.id),
            className: `hadith-mini-card ${gradeClass}`
          }, [
            Utils.createElement('span', { className: 'hadith-num' }, `#${h.idInBook || h.id}`),
            Utils.createElement('span', { className: 'hadith-grade' }, grade)
          ]);
          hadithsGrid.appendChild(miniCard);
        });
      }

      container.appendChild(hadithsGrid);
    } catch (err) {
      loader.remove();
      container.appendChild(Utils.createElement('div', { className: 'empty-state' }, [
        Utils.createElement('div', { className: 'empty-state__title' }, 'Failed to Load'),
        Utils.createElement('div', { className: 'empty-state__description' }, err.message)
      ]));
    }
  }

  async function renderHadithDetail(container, collection, bookId, hadithNum) {
    const num = parseInt(hadithNum);

    if (isNaN(num) || num < 1) {
      window.location.hash = buildRoute(collection, bookId, 1);
      return;
    }

    const backBtn = Utils.createElement('a', {
      href: buildRoute(collection, bookId),
      className: 'hadith-back-btn'
    }, '← Back to Book');
    container.appendChild(backBtn);

    const loader = Utils.createElement('div', { className: 'loader' }, [
      Utils.createElement('div', { className: 'loader__spinner' }),
      Utils.createElement('span', { className: 'loader__text' }, 'Loading hadith...')
    ]);
    container.appendChild(loader);

    try {
      const hadith = await HadithApi.getSingleHadith(collection, bookId, num);
      loader.remove();

      if (hadith && hadith.isEndOfCollection) {
        const { sunni, shia } = HadithApi.getAllBooks();
        const allBooks = [...sunni, ...shia];
        const book = allBooks.find(b => b.id === bookId);

        container.appendChild(Utils.createElement('div', { className: 'empty-state empty-state--end' }, [
          Utils.createElement('div', { className: 'empty-state__title' }, `You've reached the end of ${book?.name || bookId}`),
          Utils.createElement('div', { className: 'empty-state__description' }, `This collection contains ${hadith.totalInCollection.toLocaleString()} ahadiths. Hadith #${hadith.requestedNum} is the last one.`),
          Utils.createElement('a', {
            className: 'btn btn--primary',
            href: buildRoute(collection, bookId)
          }, 'Return to Book')
        ]));
        return;
      }

      if (!hadith || hadith.notFound) {
        container.appendChild(Utils.createElement('div', { className: 'empty-state' }, [
          Utils.createElement('div', { className: 'empty-state__title' }, 'Hadith Not Found')
        ]));
        return;
      }

      const { sunni, shia } = HadithApi.getAllBooks();
      const allBooks = [...sunni, ...shia];
      const book = allBooks.find(b => b.id === bookId);

      let grade, gradeInfo;
      let shiaGrading = null;

      if (collection === 'shia') {
        // Shia: use majlisiGrading if available, otherwise behdudiGrading
        grade = hadith.majlisiGrading || hadith.behdudiGrading || hadith.grade || 'Unknown';
        gradeInfo = getGradeInfo(grade, collection);

        // Store all Shia gradings for display
        if (hadith.majlisiGrading || hadith.behdudiGrading) {
          shiaGrading = {
            majlisi: hadith.majlisiGrading || '',
            behdudi: hadith.behdudiGrading || ''
          };
        }
      } else {
        grade = hadith.grade || 'Unknown';
        gradeInfo = getGradeInfo(grade, collection);
      }

      const chapterInfo = hadith.chapter ? hadith.chapter.name_en || hadith.chapter.name_ar : null;
      const showArabic = localStorage.getItem('hadithShowArabic') === 'true';
      const isArabicOn = showArabic;

      const isKutubAlSittah = book?.apiSource === 'fawaz';
      let toggleArabicBtn = null;

      if ((isKutubAlSittah || collection === 'shia') && hadith.arabic) {
        toggleArabicBtn = document.createElement('button');
        toggleArabicBtn.className = 'arabic-toggle-btn';

        let arabicElement = null;

        toggleArabicBtn.addEventListener('click', () => {
          const newState = localStorage.getItem('hadithShowArabic') !== 'true';
          localStorage.setItem('hadithShowArabic', newState.toString());
          toggleArabicBtn.innerHTML = newState ? 'Hide Arabic' : 'Show Arabic';
          if (!arabicElement) {
            arabicElement = hadithCard.querySelector('.hadith-arabic');
          }
          if (arabicElement) {
            arabicElement.style.display = newState ? 'block' : 'none';
          }
        });
      }

      const hadithCard = Utils.createElement('div', {
        className: 'hadith-detail-card',
        style: `border-left: 3px solid ${gradeInfo.outline};`
      }, [
        Utils.createElement('div', {
          className: 'hadith-grade-badge',
          style: `color: ${gradeInfo.outline}; border-color: ${gradeInfo.outline};`
        }, gradeInfo.label),
        Utils.createElement('div', { className: 'hadith-book-line' }, [
          Utils.createElement('span', { className: 'hadith-book-ref' }, book?.name || bookId),
          Utils.createElement('span', { className: 'hadith-number-badge' }, ` #${hadithNum}`)
        ]),
        hadith.chapter?.number ? Utils.createElement('div', { className: 'hadith-chapter-name' }, `Chapter ${hadith.chapter.number}`) : null,
        collection === 'shia' && typeof hadith.english === 'string' ? Utils.createElement('div', { className: 'hadith-text' }, hadith.english) : (
          hadith.english?.narrator ? Utils.createElement('div', { className: 'hadith-narrator', style: 'font-style: italic; margin-bottom: var(--spacing-sm);' }, hadith.english.narrator) : null
        ),
        collection === 'shia' && typeof hadith.english === 'string' ? null : (hadith.english?.text ? Utils.createElement('div', { className: 'hadith-text' }, hadith.english.text) : (hadith.text || null)),
        hadith.arabic ? Utils.createElement('div', {
          className: 'hadith-arabic rtl',
          style: `font-family: var(--font-arabic); margin-top: var(--spacing-md); font-size: var(--font-size-lg); display: ${showArabic ? 'block' : 'none'};`
        }, hadith.arabic) : null,
        (isKutubAlSittah || collection === 'shia') && hadith.arabic ? toggleArabicBtn : null,
        collection === 'shia' && shiaGrading ? Utils.createElement('div', { className: 'shia-grading' }, [
          shiaGrading.majlisi ? Utils.createElement('div', { className: 'shia-grading-item' }, [
            Utils.createElement('span', { className: 'shia-grading-label' }, 'Allamah Majlisi: '),
            Utils.createElement('span', {}, shiaGrading.majlisi)
          ]) : null,
          shiaGrading.behdudi ? Utils.createElement('div', { className: 'shia-grading-item' }, [
            Utils.createElement('span', { className: 'shia-grading-label' }, 'Shaykh Behbudi: '),
            Utils.createElement('span', {}, shiaGrading.behdudi)
          ]) : null
        ]) : null,
        Utils.createElement('div', { className: 'hadith-actions-row hadith-card-exclude' }, [
          Utils.createElement('button', {
            className: 'btn hadith-action-btn',
            title: 'Copy',
            onClick: () => copyHadith(hadith, book, hadithNum, gradeInfo, collection, bookId),
            innerHTML: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>'
          }),
          Utils.createElement('button', {
            className: 'btn hadith-action-btn',
            title: 'Share Image',
            onClick: () => shareHadithImage(hadith, book, hadithNum, gradeInfo, container),
            innerHTML: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>'
          }),
          Utils.createElement('button', {
            className: 'btn hadith-action-btn',
            title: 'Copy Link',
            onClick: () => copyHadithLink(collection, bookId, hadithNum),
            innerHTML: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>'
          }),
          Utils.createElement('button', {
            className: 'btn hadith-action-btn',
            title: 'Translate',
            onClick: () => TranslationModule.translateHadith(hadith.arabic, hadith.english?.text || hadith.english?.narrator),
            innerHTML: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>'
          })
        ])
      ]);

      container.appendChild(hadithCard);

      const navItems = [];

        if (parseInt(hadithNum) > 1) {
          navItems.push(Utils.createElement('a', {
            className: 'hadith-nav-link',
            href: buildRoute(collection, bookId, parseInt(hadithNum) - 1)
          }, [Utils.createElement('svg', { width: 10, height: 10, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2 }, Utils.createElement('path', { d: 'M19 12H5M12 19l-7-7 7-7' })), ' Prev']));
        }
        
        if ((isKutubAlSittah || collection === 'shia') && hadith.arabic) {
          toggleArabicBtn.style.cssText = `background: none; border: none; color: var(--color-text-secondary); cursor: pointer; font-size: 11px; font-weight: 400; padding: 4px 8px;`;
          toggleArabicBtn.innerHTML = showArabic ? 'Hide Arabic' : 'Show Arabic';
          navItems.push(toggleArabicBtn);
        }
        
        navItems.push(Utils.createElement('a', {
          className: 'hadith-nav-link',
          href: buildRoute(collection, bookId, parseInt(hadithNum) + 1)
        }, ['Next ', Utils.createElement('svg', { width: 10, height: 10, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2 }, Utils.createElement('path', { d: 'M5 12h14M12 5l7 7-7 7' }))]));
        
        const toggleWrapper = Utils.createElement('div', {
          style: 'display: flex; justify-content: center; gap: var(--spacing-md); margin: var(--spacing-sm) 0;'
        }, navItems);
        container.appendChild(toggleWrapper);

      // Navigation removed - consistent with Quran (users can use keyboard arrows or scroll)
    } catch (err) {
      loader.remove();
      container.appendChild(Utils.createElement('div', { className: 'empty-state' }, [
        Utils.createElement('div', { className: 'empty-state__title' }, 'Failed to Load'),
        Utils.createElement('div', { className: 'empty-state__description' }, err.message)
      ]));
    }
  }

  function getGradeInfo(grade, collection) {
    if (collection === 'shia') {
      return { outline: '#EF4444', label: grade || ' Shia' };
    }
    const g = (grade || '').toLowerCase();
    if (g.includes('sahih') || g.includes('authentic')) {
      return { outline: '#10B981', label: grade || 'Sahih' };
    }
    if (g.includes('hasan') || g.includes('good')) {
      return { outline: '#F97316', label: grade || 'Hasan' };
    }
    return { outline: '#EF4444', label: grade || 'Daif' };
  }

  function getGradeClass(grade) {
    const g = (grade || '').toLowerCase();
    if (g.includes('sahih') || g.includes('authentic')) return 'grade-sahih';
    if (g.includes('hasan') || g.includes('good')) return 'grade-hasan';
    return 'grade-daif';
  }

  function copyHadith(hadith, book, hadithNum, gradeInfo, collection, bookId) {
    const chapter = hadith.chapter?.name_en || hadith.chapter?.name_ar || '';
    const bookName = book?.name || bookId;
    const link = `${window.location.origin}${window.location.pathname}${buildRoute(collection, bookId, hadithNum)}`;

    let text = `${bookName} - ${hadithNum}\n`;
    if (hadith.chapter?.number) text += `Chp ${hadith.chapter.number}: ${chapter}\n`;
    text += '\n';

    // Handle Shia multiple gradings
    if (collection === 'shia') {
      if (hadith.majlisiGrading) text += `Grade: ${hadith.majlisiGrading}\n`;
      else if (hadith.behdudiGrading) text += `Grade: ${hadith.behdudiGrading}\n`;
    } else {
      text += `Grade: ${gradeInfo.label}\n`;
    }
    text += '\n';

    if (typeof hadith.english === 'string') {
      text += `${hadith.english}\n`;
    } else if (hadith.english?.text) {
      text += `${hadith.english.text}\n`;
    }
    text += '\n';

    if (hadith.arabic) {
      text += `${hadith.arabic}\n`;
    }
    text += '\n';

    text += `Link: ${link}`;

    navigator.clipboard.writeText(text).then(() => {
      const btns = document.querySelectorAll('.hadith-action-btn');
      if (btns[0]) {
        const originalHTML = btns[0].innerHTML;
        btns[0].innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg><span>Copied!</span>';
        setTimeout(() => { btns[0].innerHTML = originalHTML; }, 2000);
      }
    });
  }

  function copyHadithLink(collection, bookId, hadithNum) {
    const url = `${window.location.origin}${window.location.pathname}${buildRoute(collection, bookId, hadithNum)}`;
    navigator.clipboard.writeText(url).then(() => {
      const btns = document.querySelectorAll('.hadith-action-btn');
      if (btns[2]) {
        const originalHTML = btns[2].innerHTML;
        btns[2].innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg><span>Copied!</span>';
        setTimeout(() => { btns[2].innerHTML = originalHTML; }, 2000);
      }
    });
  }

  async function shareHadithImage(hadith, book, hadithNum, gradeInfo, container) {
    const card = container.querySelector('.hadith-detail-card');
    if (!card) return;

    try {
      if (typeof snapdom !== 'undefined') {
        document.getSelection()?.removeAllRanges();
        card.classList.add('hadith-capturing');
        const img = await snapdom.toPng(card, { scale: 2 });
        card.classList.remove('hadith-capturing');
        const a = document.createElement('a');
        a.href = img.src;
        a.download = `hadith-${book.id}-${hadithNum}.png`;
        a.click();
        Utils.showToast('Image downloaded!');
      } else {
        const wrapper = document.createElement('div');
        wrapper.style.cssText = 'position: absolute; left: -9999px; background: #1a1a2e; padding: 24px; border-radius: 12px; color: white; font-family: system-ui, sans-serif; max-width: 500px;';
        wrapper.innerHTML = card.innerHTML;
        document.body.appendChild(wrapper);

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', wrapper.offsetWidth);
        svg.setAttribute('height', wrapper.offsetHeight);
        const foreign = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
        foreign.setAttribute('width', '100%');
        foreign.setAttribute('height', '100%');
        foreign.appendChild(wrapper);
        svg.appendChild(foreign);

        const img = new Image();
        const svgData = new XMLSerializer().serializeToString(svg);
        img.onload = () => {
          canvas.width = wrapper.offsetWidth;
          canvas.height = wrapper.offsetHeight;
          ctx.drawImage(img, 0, 0);
          const link = document.createElement('a');
          link.download = `hadith-${book.id}-${hadithNum}.png`;
          link.href = canvas.toDataURL('image/png');
          link.click();
          document.body.removeChild(wrapper);
          Utils.showToast('Image downloaded!');
        };
        img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
      }
    } catch (err) {
      console.error('Share image error:', err);
      Utils.showToast('Failed to generate image');
    }
  }

  return { render };
})();

window.HadithView = HadithView;
