const HadithView = (() => {
  async function render(container, params = {}) {
    container.innerHTML = '';
    const content = Utils.createElement('div', { className: 'hadith-page' });
    container.appendChild(content);

    const collection = HadithApi.normalizeCollection(params.collection);

    if (params.book && params.hadith) {
      await renderHadithDetail(content, collection, params.book, params.hadith);
    } else if (params.book) {
      await renderBookInput(content, collection, params.book);
    } else {
      HadithDashboard.renderDashboard(content, collection);
    }
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
              if (h) window.location.hash = HadithDashboard.buildRoute(collection, bookId, h);
            }
          }
        }),
        Utils.createElement('button', {
          className: 'btn btn--primary hadith-search-btn',
          onClick: () => {
            const h = document.getElementById('hadith-input').value;
            if (h) window.location.hash = HadithDashboard.buildRoute(collection, bookId, h);
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

  async function renderHadithDetail(container, collection, bookId, hadithNum) {
    const num = parseInt(hadithNum);

    if (isNaN(num) || num < 1) {
      window.location.hash = HadithDashboard.buildRoute(collection, bookId, 1);
      return;
    }

    const backBtn = Utils.createElement('a', {
      href: HadithDashboard.buildRoute(collection, bookId),
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
            href: HadithDashboard.buildRoute(collection, bookId)
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
        grade = hadith.majlisiGrading || hadith.behdudiGrading || hadith.grade || 'Unknown';
        gradeInfo = HadithDashboard.getGradeInfo(grade, collection, bookId);

        if (hadith.majlisiGrading || hadith.behdudiGrading) {
          shiaGrading = {
            majlisi: hadith.majlisiGrading || '',
            behdudi: hadith.behdudiGrading || ''
          };
        }
      } else {
        grade = hadith.grade || 'Unknown';
        gradeInfo = HadithDashboard.getGradeInfo(grade, collection, bookId);
      }

      const chapterInfo = hadith.chapter ? hadith.chapter.name_en || hadith.chapter.name_ar : null;
      const showArabic = localStorage.getItem('hadithShowArabic') === 'true';

      const isKutubAlSittah = book?.apiSource === 'fawaz';
      const isScholarsBook = book?.apiSource === 'fawaz' && !['bukhari', 'muslim'].includes(book?.id);
      let toggleArabicBtn = null;
      let scholarsContainer = null;
      let scholarsToggleBtn = null;

      if (isScholarsBook && hadith.allGrades?.length > 0) {
        scholarsContainer = Utils.createElement('div', {
          className: 'hadith-scholars',
          style: 'display: none;'
        });
        hadith.allGrades.forEach(s => {
          scholarsContainer.appendChild(Utils.createElement('div', { className: 'hadith-scholar-item' }, [
            Utils.createElement('span', { className: 'hadith-scholar-name' }, s.name),
            Utils.createElement('span', { className: 'hadith-scholar-grade' }, s.grade)
          ]));
        });
        scholarsToggleBtn = document.createElement('button');
        scholarsToggleBtn.className = 'btn hadith-action-btn hadith-scholars-toggle';
        scholarsToggleBtn.title = 'Scholar gradings';
        scholarsToggleBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>`;
        scholarsToggleBtn.addEventListener('click', () => {
          const hidden = scholarsContainer.style.display === 'none';
          scholarsContainer.style.display = hidden ? 'block' : 'none';
          scholarsToggleBtn.classList.toggle('active', hidden);
          if (hidden) {
            const items = scholarsContainer.querySelectorAll('.hadith-scholar-item');
            items.forEach((item, i) => {
              item.style.animation = `none`;
              item.offsetHeight;
              item.style.animation = `scholarFadeIn 0.25s ease ${i * 0.04}s both`;
            });
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
        bookId === 'muslim' ? Utils.createElement('div', { style: 'font-size:0.6rem;color:var(--color-text-muted);opacity:0.6;margin:0 0 var(--spacing-xs);' }, 'Abdul Hamid Siddiqui numbering') : null,
        hadith.chapter?.number ? Utils.createElement('div', { className: 'hadith-chapter-name' }, `Chp ${hadith.chapter.number}${hadith.chapter.name_en ? `: ${hadith.chapter.name_en}` : ''}`) : null,
        collection === 'shia' && typeof hadith.english === 'string' ? Utils.createElement('div', { className: 'hadith-text' }, hadith.english) : (
          hadith.english?.narrator ? Utils.createElement('div', { className: 'hadith-narrator', style: 'font-style: italic; margin-bottom: var(--spacing-sm);' }, hadith.english.narrator) : null
        ),
        collection === 'shia' && typeof hadith.english === 'string' ? null : (hadith.english?.text ? Utils.createElement('div', { className: 'hadith-text' }, hadith.english.text) : null),
        hadith.arabic ? Utils.createElement('div', {
          className: 'hadith-arabic rtl',
          style: `font-family: var(--font-arabic); margin-top: var(--spacing-md); font-size: var(--font-size-lg); display: ${(hadith.english?.text || typeof hadith.english === 'string') ? (showArabic ? 'block' : 'none') : 'block'};`
        }, hadith.arabic) : null,
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
        scholarsContainer,
        Utils.createElement('div', { className: 'hadith-actions-row hadith-card-exclude' }, [
          Utils.createElement('button', {
            className: 'btn hadith-action-btn',
            title: 'Copy',
            onClick: (e) => copyHadith(hadith, book, hadithNum, gradeInfo, collection, bookId, e.currentTarget),
            innerHTML: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>'
          }),
          Utils.createElement('button', {
            className: 'btn hadith-action-btn',
            title: 'Share Image',
            onClick: (e) => shareHadithImage(hadith, book, hadithNum, container),
            innerHTML: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>'
          }),
          Utils.createElement('button', {
            className: 'btn hadith-action-btn',
            title: 'Copy Link',
            onClick: (e) => Share.copyLink(HadithDashboard.buildRoute(collection, bookId, hadithNum), { btn: e.currentTarget }),
            innerHTML: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>'
          }),
          Utils.createElement('button', {
            className: 'btn hadith-action-btn',
            title: 'Translate',
            onClick: () => TranslationModule.translateHadith(hadith.arabic, hadith.english?.text || hadith.english?.narrator),
            innerHTML: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>'
          }),
          scholarsToggleBtn
        ])
      ]);

      container.appendChild(hadithCard);

      const navItems = [];

        if (parseInt(hadithNum) > 1) {
          navItems.push(Utils.createElement('a', {
            className: 'hadith-nav-link',
            href: HadithDashboard.buildRoute(collection, bookId, parseInt(hadithNum) - 1)
          }, [Utils.createElement('svg', { width: 10, height: 10, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2 }, Utils.createElement('path', { d: 'M19 12H5M12 19l-7-7 7-7' })), ' Prev']));
        }
        
      if (hadith.arabic) {
          const toggleBtn = document.createElement('button');
          toggleBtn.style.cssText = 'background:none;border:none;color:var(--color-text-secondary);cursor:pointer;font-size:11px;font-weight:400;padding:4px 8px;';
          toggleBtn.innerHTML = showArabic ? 'Hide Arabic' : 'Show Arabic';
          toggleBtn.addEventListener('click', () => {
            const newState = localStorage.getItem('hadithShowArabic') !== 'true';
            localStorage.setItem('hadithShowArabic', newState.toString());
            toggleBtn.innerHTML = newState ? 'Hide Arabic' : 'Show Arabic';
            const ae = hadithCard.querySelector('.hadith-arabic');
            if (ae) ae.style.display = newState ? 'block' : 'none';
          });
          navItems.push(toggleBtn);
        }
        
        navItems.push(Utils.createElement('a', {
          className: 'hadith-nav-link',
          href: HadithDashboard.buildRoute(collection, bookId, parseInt(hadithNum) + 1)
        }, ['Next ', Utils.createElement('svg', { width: 10, height: 10, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2 }, Utils.createElement('path', { d: 'M5 12h14M12 5l7 7-7 7' }))]));
        
        const toggleWrapper = Utils.createElement('div', {
          style: 'display: flex; justify-content: center; gap: var(--spacing-md); margin: var(--spacing-sm) 0;'
        }, navItems);
        container.appendChild(toggleWrapper);

    } catch (err) {
      loader.remove();
      container.appendChild(Utils.createElement('div', { className: 'empty-state' }, [
        Utils.createElement('div', { className: 'empty-state__title' }, 'Failed to Load'),
        Utils.createElement('div', { className: 'empty-state__description' }, err.message)
      ]));
    }
  }

  function copyHadith(hadith, book, hadithNum, gradeInfo, collection, bookId, btn) {
    const chapter = hadith.chapter?.name_en || hadith.chapter?.name_ar || '';
    const bookName = book?.name || bookId;
    const link = `${window.location.origin}${window.location.pathname}${HadithDashboard.buildRoute(collection, bookId, hadithNum)}`;

    let text = `${bookName} - ${hadithNum}\n`;
    if (hadith.chapter?.number) text += `Chp ${hadith.chapter.number}: ${chapter}\n`;
    text += '\n';

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

    Share.copyText(text, { btn, toast: '' });
  }

  async function shareHadithImage(hadith, book, hadithNum, container) {
    const card = container.querySelector('.hadith-detail-card');
    if (!card) return;
    await Share.captureImage(card, `hadith-${book.id}-${hadithNum}.png`, {
      captureClass: 'hadith-capturing'
    });
  }

  return { render };
})();

window.HadithView = HadithView;
