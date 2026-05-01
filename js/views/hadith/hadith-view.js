const HadithView = (() => {
  let currentBook = null;
  let currentHadithIndex = 0;
  let hadithsData = null;
  let currentBookId = 'bukhari';

  async function render(container, params = {}) {
    container.innerHTML = '';
    const content = Utils.createElement('div', { id: 'hadith-content', className: 'hadith-page' });
    container.appendChild(content);

    if (params.book && params.number) {
      await loadSpecificHadith(content, params.book, params.number);
    } else {
      renderBookSelector(content);
    }
  }

  function renderBookSelector(container) {
    const books = HadithApi.getKutubAlSittah();
    
    const header = Utils.createElement('div', { className: 'page-header' }, [
      Utils.createElement('h1', { className: 'page-header__title', style: 'color: var(--color-hadith);' }, 'Hadith Collections'),
      Utils.createElement('p', { className: 'page-header__subtitle' }, 'Kutub al-Sittah - The Six Major Books')
    ]);
    container.appendChild(header);

    const selectWrapper = Utils.createElement('div', { 
      style: 'display: flex; gap: var(--spacing-md); margin-bottom: var(--spacing-lg); flex-wrap: wrap; align-items: center;'
    });

    const bookSelect = Utils.createElement('select', {
      className: 'input',
      id: 'hadith-book-select',
      style: 'flex: 1; min-width: 200px;'
    });
    
    books.forEach((book, index) => {
      const option = Utils.createElement('option', { 
        value: book.id,
        textContent: `${book.name} (${book.arabic})`
      });
      if (book.id === currentBookId) option.selected = true;
      bookSelect.appendChild(option);
    });

    const numberInput = Utils.createElement('input', {
      type: 'number',
      className: 'input',
      id: 'hadith-number-input',
      placeholder: 'Hadith #',
      min: 1,
      style: 'width: 100px;'
    });

    const goBtn = Utils.createElement('button', {
      className: 'btn btn--primary',
      onClick: () => {
        const bookId = document.getElementById('hadith-book-select').value;
        const number = document.getElementById('hadith-number-input').value;
        if (number) {
          window.location.hash = `#hadiths/${bookId}/${number}`;
        }
      }
    }, 'Go');

    selectWrapper.appendChild(bookSelect);
    selectWrapper.appendChild(numberInput);
    selectWrapper.appendChild(goBtn);
    container.appendChild(selectWrapper);

    const booksGrid = Utils.createElement('div', { className: 'grid grid--responsive' });
    
    books.forEach(book => {
      const card = Utils.createElement('a', {
        className: 'card hadith-book-card',
        href: `#hadiths/${book.id}/1`,
        style: 'text-align: center; cursor: pointer;'
      }, [
        Utils.createElement('div', { 
          className: 'hadith-book-arabic',
          style: 'font-family: var(--font-arabic); font-size: var(--font-size-2xl); color: var(--color-hadith); margin-bottom: var(--spacing-sm);'
        }, book.arabic),
        Utils.createElement('div', { 
          className: 'hadith-book-name',
          style: 'font-weight: 600;'
        }, book.name)
      ]);
      booksGrid.appendChild(card);
    });

    container.appendChild(booksGrid);
  }

  async function loadSpecificHadith(container, bookId, hadithNumber) {
    currentBookId = bookId;
    
    const loader = Utils.createElement('div', { className: 'loader' }, [
      Utils.createElement('div', { className: 'loader__spinner' }),
      Utils.createElement('span', { className: 'loader__text' }, `Loading ${hadithNumber}...`)
    ]);
    container.appendChild(loader);

    try {
      const data = await HadithApi.getBookHadiths(bookId);
      const processed = HadithApi.processHadithData(data, bookId);
      
      if (!processed || !processed.hadiths) throw new Error('No hadiths found');
      
      hadithsData = processed;
      const index = processed.hadiths.findIndex(h => h.hadithNumber == hadithNumber);
      currentHadithIndex = index >= 0 ? index : 0;
      
      loader.remove();
      renderHadithView(container);
    } catch (err) {
      console.error('Failed to load hadith:', err);
      loader.remove();
      container.appendChild(Utils.createElement('div', { className: 'empty-state' }, [
        Utils.createElement('div', { className: 'empty-state__title' }, 'Failed to Load'),
        Utils.createElement('div', { className: 'empty-state__description' }, `Could not load hadith #${hadithNumber} from ${bookId}`),
        Utils.createElement('a', { className: 'btn btn--primary', href: '#hadiths', style: 'margin-top: var(--spacing-xl); display: inline-block;' }, 'Back to Books')
      ]));
    }
  }

  function renderHadithView(container) {
    container.innerHTML = '';
    
    const books = HadithApi.getKutubAlSittah();
    const currentBook = books.find(b => b.id === currentBookId) || { name: currentBookId };
    
    const breadcrumb = Utils.createElement('div', { className: 'breadcrumb' }, [
      Utils.createElement('a', { className: 'breadcrumb__item', href: '#hadiths' }, 'Hadiths'),
      Utils.createElement('span', { className: 'breadcrumb__separator' }, '/'),
      Utils.createElement('span', { className: 'breadcrumb__item' }, currentBook.name)
    ]);
    container.appendChild(breadcrumb);

    const controls = Utils.createElement('div', { 
      style: 'display: flex; gap: var(--spacing-md); margin-bottom: var(--spacing-lg); flex-wrap: wrap;'
    });

    const bookSelect = Utils.createElement('select', {
      className: 'input',
      id: 'hadith-book-select',
      style: 'flex: 1; min-width: 150px;'
    });
    
    books.forEach(book => {
      const option = Utils.createElement('option', { 
        value: book.id,
        textContent: book.name
      });
      if (book.id === currentBookId) option.selected = true;
      bookSelect.appendChild(option);
    });

    const numberInput = Utils.createElement('input', {
      type: 'number',
      className: 'input',
      id: 'hadith-number-input',
      min: 1,
      value: hadithsData.hadiths[currentHadithIndex]?.hadithNumber || 1,
      style: 'width: 80px;'
    });

    const goBtn = Utils.createElement('button', {
      className: 'btn btn--primary btn--sm',
      onClick: () => {
        const bookId = document.getElementById('hadith-book-select').value;
        const number = document.getElementById('hadith-number-input').value;
        window.location.hash = `#hadiths/${bookId}/${number}`;
      }
    }, 'Go');

    controls.appendChild(bookSelect);
    controls.appendChild(numberInput);
    controls.appendChild(goBtn);
    container.appendChild(controls);

    const hadith = hadithsData.hadiths[currentHadithIndex];
    if (!hadith) {
      container.appendChild(Utils.createElement('div', { className: 'empty-state' }, [
        Utils.createElement('div', { className: 'empty-state__title' }, 'Hadith not found')
      ]));
      return;
    }

    const gradeInfo = hadith.gradeInfo;
    const gradeClass = HadithApi.getGradeClass(gradeInfo.type);

    const hadithCard = Utils.createElement('div', { 
      className: `card hadith-card ${gradeClass}`,
      style: `border-left: 4px solid ${gradeInfo.color};`
    });

    const gradeSection = Utils.createElement('div', { 
      className: 'hadith-grade-section',
      style: `background: ${gradeInfo.color}15; border-bottom: 1px solid ${gradeInfo.color}30; padding: var(--spacing-md); margin: calc(-1 * var(--spacing-lg)) calc(-1 * var(--spacing-lg)) var(--spacing-md) calc(-1 * var(--spacing-lg));`
    });
    
    gradeSection.appendChild(Utils.createElement('div', { 
      className: 'hadith-grade-main',
      style: `color: ${gradeInfo.color}; font-weight: 700; font-size: var(--font-size-lg); margin-bottom: var(--spacing-sm);`
    }, gradeInfo.label));

    if (hadith.grades && hadith.grades.length > 0) {
      const gradesList = Utils.createElement('div', { className: 'hadith-grades-list' });
      hadith.grades.forEach(g => {
        gradesList.appendChild(Utils.createElement('span', { 
          className: 'hadith-grade-item',
          style: 'display: inline-block; margin-right: var(--spacing-md); margin-bottom: var(--spacing-xs); font-size: var(--font-size-xs); color: var(--color-text-secondary);'
        }, `${g.scholar}: ${g.grade}`));
      });
      gradeSection.appendChild(gradesList);
    }

    hadithCard.appendChild(gradeSection);

    if (hadith.text?.arabic) {
      const arabicText = Utils.createElement('p', {
        className: 'rtl arab-text',
        style: 'font-family: var(--font-arabic); font-size: var(--font-size-xl); line-height: var(--line-height-arabic); color: var(--color-hadith); margin-bottom: var(--spacing-lg); text-align: right;'
      }, hadith.text.arabic);
      hadithCard.appendChild(arabicText);
    }

    if (hadith.text?.english) {
      const englishText = Utils.createElement('p', {
        className: 'hadith-english',
        style: 'font-size: var(--font-size-lg); line-height: var(--line-height-relaxed); color: var(--color-text);'
      }, hadith.text.english);
      hadithCard.appendChild(englishText);
    }

    const navButtons = Utils.createElement('div', { 
      className: 'hadith-nav',
      style: 'display: flex; gap: var(--spacing-sm); justify-content: center; margin-top: var(--spacing-xl); flex-wrap: wrap;'
    });

    const hasPrev = currentHadithIndex > 0;
    const hasNext = currentHadithIndex < hadithsData.hadiths.length - 1;

    navButtons.appendChild(Utils.createElement('button', {
      className: 'btn btn--outline btn--sm',
      disabled: !hasPrev,
      onClick: () => {
        if (hasPrev) {
          currentHadithIndex--;
          const prevNum = hadithsData.hadiths[currentHadithIndex].hadithNumber;
          window.location.hash = `#hadiths/${currentBookId}/${prevNum}`;
        }
      }
    }, '← Previous'));

    navButtons.appendChild(Utils.createElement('button', {
      className: 'btn btn--ghost btn--sm',
      onClick: () => copyHadith(hadith, currentBook)
    }, 'Copy'));

    const shareBtn = Utils.createElement('button', {
      className: 'btn btn--ghost btn--sm',
      onClick: () => shareHadith(hadith, currentBook)
    }, 'Share');

    navButtons.appendChild(shareBtn);

    navButtons.appendChild(Utils.createElement('button', {
      className: 'btn btn--outline btn--sm',
      disabled: !hasNext,
      onClick: () => {
        if (hasNext) {
          currentHadithIndex++;
          const nextNum = hadithsData.hadiths[currentHadithIndex].hadithNumber;
          window.location.hash = `#hadiths/${currentBookId}/${nextNum}`;
        }
      }
    }, 'Next →'));

    hadithCard.appendChild(navButtons);

    container.appendChild(hadithCard);

    const allHadithsSection = Utils.createElement('div', { className: 'hadith-all-section' });
    allHadithsSection.appendChild(Utils.createElement('h3', { 
      style: 'margin-bottom: var(--spacing-md); color: var(--color-text-secondary);'
    }, `All ${currentBook.name} Hadiths`));

    const hadithsList = Utils.createElement('div', { className: 'hadiths-mini-list' });
    
    hadithsData.hadiths.slice(0, 50).forEach((h, idx) => {
      const gInfo = HadithApi.normalizeGrading(h.grade);
      const miniCard = Utils.createElement('a', {
        href: `#hadiths/${currentBookId}/${h.hadithNumber}`,
        className: `hadith-mini-card ${HadithApi.getGradeClass(gInfo.type)}`,
        style: `border-left: 3px solid ${gInfo.color};`
      }, [
        Utils.createElement('span', { 
          style: 'font-weight: 600; margin-right: var(--spacing-sm);'
        }, `#${h.hadithNumber}`),
        Utils.createElement('span', { 
          style: 'color: var(--color-text-muted); font-size: var(--font-size-xs);'
        }, h.grade)
      ]);
      hadithsList.appendChild(miniCard);
    });

    allHadithsSection.appendChild(hadithsList);
    container.appendChild(allHadithsSection);
  }

  function copyHadith(hadith, book) {
    let text = `${book.name}\n`;
    text += `Hadith #${hadith.hadithNumber}\n\n`;
    if (hadith.text?.arabic) text += `${hadith.text.arabic}\n\n`;
    if (hadith.text?.english) text += `${hadith.text.english}\n\n`;
    text += `Grade: ${hadith.gradeInfo.label}\n`;
    if (hadith.grades) {
      hadith.grades.forEach(g => {
        text += `${g.scholar}: ${g.grade}\n`;
      });
    }
    text += `\n— salaf.Init();`;

    navigator.clipboard.writeText(text).then(() => {
      Utils.showToast('Hadith copied with all details!');
    }).catch(() => {
      Utils.showToast('Failed to copy', 'error');
    });
  }

  function shareHadith(hadith, book) {
    const url = `${window.location.origin}${window.location.pathname}#hadiths/${currentBookId}/${hadith.hadithNumber}`;
    
    if (navigator.share) {
      navigator.share({
        title: `${book.name} - Hadith #${hadith.hadithNumber}`,
        text: `"${hadith.text?.english?.substring(0, 100)}..." - Grade: ${hadith.grade}`,
        url: url
      });
    } else {
      navigator.clipboard.writeText(url).then(() => {
        Utils.showToast('Link copied!');
      });
    }
  }

  return { render };
})();