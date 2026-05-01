const QuranView = (() => {
  let currentSurahData = null;
  let currentHilaliData = null;
  let currentTafsirModal = null;

  function formatTranslation(text) {
    if (!text) return '';
    const parts = text.split(/(\([^)]*\)|\[[^\]]*\])/g);
    return parts.map(part => {
      if (!part) return '';
      if (part.startsWith('(') || part.startsWith('[')) {
        return `<span class="bracket">${part}</span>`;
      }
      return `<strong>${part}</strong>`;
    }).join('');
  }

  function openSettingsModal() {
    const existing = document.querySelector('.quran-settings-overlay');
    if (existing) existing.remove();

    const currentPrimary = Store.get('quranTranslation1') || 'en.hilali';
    const currentSecondary = Store.get('quranTranslation2') || '';
    const currentTertiary = Store.get('quranTranslation3') || '';

    const overlay = Utils.createElement('div', {
      className: 'quran-settings-overlay',
      onClick: (e) => {
        if (e.target === overlay) overlay.remove();
      }
    });

    const createInput = (label, currentValue, key, placeholder) => {
      const wrapper = Utils.createElement('div', { style: 'margin-bottom: var(--spacing-md);' });
      wrapper.appendChild(Utils.createElement('label', { style: 'display: block; margin-bottom: var(--spacing-xs); font-size: var(--font-size-sm); color: var(--color-text-secondary);' }, label));
      
      const input = Utils.createElement('input', {
        type: 'text',
        className: 'input',
        id: `translation-${key}`,
        value: currentValue,
        placeholder: placeholder,
        style: 'width: 100%;'
      });
      
      wrapper.appendChild(input);
      return wrapper;
    };

    const modal = Utils.createElement('div', { className: 'quran-settings-modal', style: 'max-width: 450px;' }, [
      Utils.createElement('h3', { style: 'margin-bottom: var(--spacing-lg);' }, 'Quran Translation Settings'),
      
      createInput('Primary Translation (e.g., en.hilali)', currentPrimary, '1', 'en.hilali'),
      createInput('Secondary Translation (optional)', currentSecondary, '2', 'en.sahih'),
      createInput('Tertiary Translation (optional)', currentTertiary, '3', 'en.pickthall'),
      
      Utils.createElement('div', { style: 'background: var(--color-surface); padding: var(--spacing-md); border-radius: var(--radius-md); margin-bottom: var(--spacing-md);' }, [
        Utils.createElement('p', { style: 'font-size: var(--font-size-sm); font-weight: 600; margin-bottom: var(--spacing-sm);' }, 'Common Translation Identifiers:'),
        Utils.createElement('p', { style: 'font-size: var(--font-size-xs); color: var(--color-text-secondary); margin-bottom: var(--spacing-xs);' }, '• en.hilali - Hilali & Khan'),
        Utils.createElement('p', { style: 'font-size: var(--font-size-xs); color: var(--color-text-secondary); margin-bottom: var(--spacing-xs);' }, '• en.sahih - Saheeh International'),
        Utils.createElement('p', { style: 'font-size: var(--font-size-xs); color: var(--color-text-secondary); margin-bottom: var(--spacing-xs);' }, '• en.pickthall - Pickthall'),
        Utils.createElement('p', { style: 'font-size: var(--font-size-xs); color: var(--color-text-secondary); margin-bottom: var(--spacing-xs);' }, '• en.yusufali - Yusuf Ali'),
        Utils.createElement('p', { style: 'font-size: var(--font-size-xs); color: var(--color-text-secondary); margin-bottom: var(--spacing-xs);' }, '• en.haleem - Haleem'),
        Utils.createElement('p', { style: 'font-size: var(--font-size-xs); color: var(--color-text-secondary);' }, 'Find more at api.alquran.cloud/v1/edition?type=translation')
      ]),
      
      Utils.createElement('div', { style: 'display: flex; gap: var(--spacing-sm); flex-wrap: wrap;' }, [
        Utils.createElement('button', {
          className: 'btn btn--primary',
          onClick: () => {
            const sel1 = document.getElementById('translation-1').value.trim() || 'en.hilali';
            const sel2 = document.getElementById('translation-2').value.trim();
            const sel3 = document.getElementById('translation-3').value.trim();
            
            Store.set('quranTranslation1', sel1);
            Store.set('quranTranslation2', sel2);
            Store.set('quranTranslation3', sel3);
            Utils.showToast('Translations saved! Reloading...');
            overlay.remove();
            window.location.reload();
          }
        }, 'Save'),
        Utils.createElement('button', {
          className: 'btn btn--outline',
          onClick: () => {
            Store.set('quranTranslation1', 'en.hilali');
            Store.set('quranTranslation2', '');
            Store.set('quranTranslation3', '');
            Utils.showToast('Reset to Al-Hilali! Reloading...');
            overlay.remove();
            window.location.reload();
          }
        }, 'Reset to Al-Hilali'),
        Utils.createElement('button', {
          className: 'btn btn--ghost',
          onClick: () => overlay.remove()
        }, 'Cancel')
      ])
    ]);

    overlay.appendChild(modal);
    document.body.appendChild(overlay);
  }

  function render(container, params = {}) {
    container.innerHTML = '';

    const header = Utils.createElement('div', { className: 'page-header', style: 'position: relative;' }, [
      Utils.createElement('h1', { className: 'page-header__title quran-title' }, 'The Noble Quran'),
      Utils.createElement('p', { className: 'page-header__subtitle' }, 'Uthmani Text with Al-Hilali Translation and Tafsir Ibn Kathir'),
      Utils.createElement('button', {
        className: 'quran-settings-btn',
        onClick: () => openSettingsModal()
      }, '⚙')
    ]);
    container.appendChild(header);

    if (params.tafsir) {
      loadSurahForTafsir(container, params);
    } else if (params.surah) {
      loadSurah(container, params);
    } else {
      renderSurahList(container);
    }
  }

  async function renderSurahList(container) {
    const loader = Utils.createElement('div', { className: 'loader' }, [
      Utils.createElement('div', { className: 'loader__spinner loader-spinner-gold' }),
      Utils.createElement('span', { className: 'loader__text' }, 'Loading Surahs...')
    ]);
    container.appendChild(loader);

    try {
      const data = await QuranApi.getSurahList();
      loader.remove();

      const lastRead = Store.get('lastRead');
      const surahs = data.data || [];

      if (lastRead && lastRead.surah) {
        const continueBtn = Utils.createElement('a', {
          className: 'btn btn--accent btn--full quran-continue-btn',
          href: '#quran/' + lastRead.surah + '/' + (lastRead.ayah || 1),
          style: 'margin-bottom: var(--spacing-lg);'
        }, 'Continue: ' + (lastRead.surahName || 'Surah ' + lastRead.surah) + ' (Ayah ' + (lastRead.ayah || 1) + ')');
        container.appendChild(continueBtn);
      }

      const searchRow = Utils.createElement('div', { style: 'margin-bottom: var(--spacing-lg); display: flex; gap: var(--spacing-sm); align-items: stretch;' }, [
        Utils.createElement('input', {
          className: 'input quran-search-input',
          id: 'surah-search',
          placeholder: 'Surah 1, ayah 2:286, or a word...',
          style: 'flex: 1;'
        }),
        Utils.createElement('button', {
          className: 'btn btn--primary quran-search-btn',
          id: 'search-btn',
          style: 'white-space: nowrap;'
        }, 'Go')
      ]);
      container.appendChild(searchRow);

      container.appendChild(Utils.createElement('div', {
        id: 'global-search-results',
        style: 'display: none; margin-bottom: var(--spacing-lg);'
      }));

      const grid = Utils.createElement('div', { id: 'surah-grid', className: 'grid grid--responsive' });

      function renderGrid(filteredSurahs) {
        grid.innerHTML = '';
        filteredSurahs.forEach((surah) => {
          const isMeccan = surah.revelationType === 'Meccan';
          const badgeClass = isMeccan ? 'badge badge--Meccan' : 'badge badge--Madinah';
          const card = Utils.createElement('a', {
            className: 'card quran-surah-card',
            href: '#quran/' + surah.number,
            style: 'cursor: pointer; position: relative; overflow: hidden;'
          }, [
            Utils.createElement('div', { className: 'quran-surah-card__border' }),
            Utils.createElement('div', { style: 'display: flex; justify-content: space-between; align-items: center; position: relative; z-index: 1;' }, [
              Utils.createElement('div', {}, [
                Utils.createElement('h3', { className: 'card__title quran-surah-card__title' }, `${surah.number}. ${surah.englishName}`),
                Utils.createElement('p', { className: 'card__description' }, `${surah.englishNameTranslation} • ${surah.numberOfAyahs} ayahs`)
              ]),
              Utils.createElement('span', {
                className: badgeClass
              }, surah.revelationType)
            ])
          ]);
          grid.appendChild(card);
        });
      }

      renderGrid(surahs);
      container.appendChild(grid);

      const searchInput = document.getElementById('surah-search');
      const resultsDiv = document.getElementById('global-search-results');
      const searchBtn = document.getElementById('search-btn');

      let searchTimeout;

      function parseSearchQuery(query) {
        const trimmed = query.trim();
        const colonMatch = trimmed.match(/^(\d+):(\d+)$/);
        if (colonMatch) {
          return { type: 'ayah', surah: parseInt(colonMatch[1]), ayah: parseInt(colonMatch[2]) };
        }
        const surahNum = parseInt(trimmed);
        if (!isNaN(surahNum) && surahNum >= 1 && surahNum <= 114) {
          return { type: 'surah', surah: surahNum };
        }
        return { type: 'search', query: trimmed };
      }

      function handleSearch() {
        const query = searchInput.value.trim();
        if (!query) return;

        const parsed = parseSearchQuery(query);

        if (parsed.type === 'ayah') {
          window.location.hash = `#quran/${parsed.surah}/${parsed.ayah}`;
        } else if (parsed.type === 'surah') {
          window.location.hash = `#quran/${parsed.surah}`;
        } else {
          resultsDiv.style.display = 'none';
          renderGrid(surahs.filter(s =>
            s.englishName.toLowerCase().includes(query.toLowerCase()) ||
            s.englishNameTranslation.toLowerCase().includes(query.toLowerCase()) ||
            String(s.number).includes(query) ||
            s.name.toLowerCase().includes(query.toLowerCase())
          ));

          let currentSearchQuery = '';
          let currentPage = 1;
          let allMatches = [];
          let hasMoreResults = false;

          function stripHtmlTags(html) {
            if (!html) return '';
            const tmp = document.createElement('div');
            tmp.innerHTML = html;
            return tmp.textContent || tmp.innerText || '';
          }

          function escapeHtml(text) {
            if (!text) return '';
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
          }

          function highlightText(text, searchTerm) {
            if (!text) return '';
            const cleanText = stripHtmlTags(text);
            if (!searchTerm) return escapeHtml(cleanText);
            const safeTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(`(${safeTerm})`, 'gi');
            return escapeHtml(cleanText).replace(regex, '<mark style="background:rgba(246,193,119,0.5);color:#F6C177;padding:1px 3px;border-radius:2px;">$1</mark>');
          }

          function renderSearchResults(matches, total, hasMore) {
            resultsDiv.innerHTML = '';
            resultsDiv.style.display = 'block';

            const countText = total > 0 ? `Found ${total} results for "${currentSearchQuery}":` : `No results found for "${currentSearchQuery}".`;
            resultsDiv.appendChild(Utils.createElement('p', {
              style: 'font-size: var(--font-size-sm); color: var(--color-text-secondary); margin-bottom: var(--spacing-md);'
            }, countText));

            const resultsGrid = document.createElement('div');
            resultsGrid.className = 'grid grid--responsive';

            matches.forEach(match => {
              const highlighted = highlightText(match.translation || '', currentSearchQuery);

              const resultCard = document.createElement('a');
              resultCard.className = 'card';
              resultCard.href = '#quran/' + match.surah.number + '/' + match.numberInSurah;
              resultCard.style.cssText = 'cursor:pointer;display:block;';

              const badge = document.createElement('span');
              badge.className = 'badge badge--primary';
              badge.textContent = 'Q' + match.surah.number + ':' + match.numberInSurah;

              const para = document.createElement('p');
              para.className = 'card__description';
              para.style.cssText = 'margin-top:var(--spacing-sm);font-size:var(--font-size-sm);';
              para.innerHTML = highlighted.substring(0, 200) + (highlighted.length > 200 ? '...' : '');

              resultCard.appendChild(badge);
              resultCard.appendChild(para);
              resultsGrid.appendChild(resultCard);
            });

            resultsDiv.appendChild(resultsGrid);

            if (hasMore) {
              const loadMoreBtn = document.createElement('button');
              loadMoreBtn.className = 'btn btn--primary';
              loadMoreBtn.style.cssText = 'margin-top:var(--spacing-md);width:100%;';
              loadMoreBtn.textContent = 'Load More Results';
              loadMoreBtn.onclick = () => loadMoreResults();
              resultsDiv.appendChild(loadMoreBtn);
            }
          }

          async function loadMoreResults() {
            currentPage++;
            const loadMoreBtn = resultsDiv.querySelector('.load-more-btn');
            if (loadMoreBtn) {
              loadMoreBtn.textContent = 'Loading...';
              loadMoreBtn.disabled = true;
            }

            const searchResults = await QuranApi.search(currentSearchQuery, currentPage);
            const newMatches = searchResults?.data?.matches || [];

            allMatches = [...allMatches, ...newMatches];
            hasMoreResults = searchResults?.data?.hasMore || false;

            const resultsGrid = resultsDiv.querySelector('.grid');
            if (resultsGrid) {
              newMatches.forEach(match => {
                const highlighted = highlightText(match.translation || '', currentSearchQuery);

                const resultCard = document.createElement('a');
                resultCard.className = 'card';
                resultCard.href = '#quran/' + match.surah.number + '/' + match.numberInSurah;
                resultCard.style.cssText = 'cursor:pointer;display:block;';

                const badge = document.createElement('span');
                badge.className = 'badge badge--primary';
                badge.textContent = 'Q' + match.surah.number + ':' + match.numberInSurah;

                const para = document.createElement('p');
                para.className = 'card__description';
                para.style.cssText = 'margin-top:var(--spacing-sm);font-size:var(--font-size-sm);';
                para.innerHTML = highlighted.substring(0, 200) + (highlighted.length > 200 ? '...' : '');

                resultCard.appendChild(badge);
                resultCard.appendChild(para);
                resultsGrid.appendChild(resultCard);
              });
            }

            if (loadMoreBtn) {
              if (hasMoreResults) {
                loadMoreBtn.textContent = 'Load More Results';
                loadMoreBtn.disabled = false;
              } else {
                loadMoreBtn.remove();
              }
            }
          }

          QuranApi.search(query).then(searchResults => {
            console.log('Search results in view:', searchResults);
            const data = searchResults?.data;
            if (data && data.matches && data.matches.length > 0) {
              currentSearchQuery = query;
              currentPage = 1;
              allMatches = data.matches;
              hasMoreResults = data.hasMore || false;

              renderSearchResults(allMatches, data.total || data.matches.length, hasMoreResults);
            } else {
              resultsDiv.innerHTML = '';
              resultsDiv.style.display = 'block';
              resultsDiv.appendChild(Utils.createElement('p', { style: 'font-size: var(--font-size-sm); color: var(--color-text-secondary);' }, `No results found for "${query}". Try a different search.`));
            }
          }).catch(err => {
            console.error('Global search error:', err);
          });
        }
      }

      searchBtn.addEventListener('click', handleSearch);

      searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          handleSearch();
        }
      });

    } catch (error) {
      loader.remove();
      const errorState = Utils.createElement('div', { className: 'empty-state' }, [
        Utils.createElement('div', { className: 'empty-state__title' }, 'Failed to Load'),
        Utils.createElement('div', { className: 'empty-state__description' }, 'Could not load surah list. Please check your connection.')
      ]);
      container.appendChild(errorState);
    }
  }

  async function loadSurahForTafsir(container, params) {
    const translations = [
      Store.get('quranTranslation1') || 'en.hilali',
      Store.get('quranTranslation2'),
      Store.get('quranTranslation3')
    ].filter(Boolean);

    try {
      const [uthmaniData, ...translationData] = await Promise.all([
        QuranApi.getSurah(params.surah, 'quran-uthmani'),
        ...translations.map(t => QuranApi.getSurah(params.surah, t))
      ]);
      currentSurahData = uthmaniData.data;
      currentHilaliData = translationData[0]?.data || null;
      renderSurahContent(container, uthmaniData.data, currentHilaliData, params.ayah, translationData);
      setTimeout(() => openTafsirModal(params.surah, params.ayah, uthmaniData.data, currentHilaliData), 300);
    } catch (error) {
      container.appendChild(Utils.createElement('div', { className: 'empty-state' }, [
        Utils.createElement('div', { className: 'empty-state__title' }, 'Failed to Load'),
        Utils.createElement('div', { className: 'empty-state__description' }, 'Could not load surah.'),
        Utils.createElement('a', { className: 'btn btn--primary', href: '#quran', style: 'margin-top: var(--spacing-xl); display: inline-block;' }, 'Back to Surah List')
      ]));
    }
  }

  async function loadSurah(container, params) {
    const loader = Utils.createElement('div', { className: 'loader' }, [
      Utils.createElement('div', { className: 'loader__spinner loader-spinner-gold' }),
      Utils.createElement('span', { className: 'loader__text' }, `Loading Surah ${params.surah}...`)
    ]);
    container.appendChild(loader);

    const translations = [
      Store.get('quranTranslation1') || 'en.hilali',
      Store.get('quranTranslation2'),
      Store.get('quranTranslation3')
    ].filter(Boolean);

    try {
      const [uthmaniData, ...translationData] = await Promise.all([
        QuranApi.getSurah(params.surah, 'quran-uthmani'),
        ...translations.map(t => QuranApi.getSurah(params.surah, t))
      ]);

      loader.remove();
      currentSurahData = uthmaniData.data;
      currentHilaliData = translationData[0]?.data || null;
      renderSurahContent(container, uthmaniData.data, currentHilaliData, params.ayah, translationData);

      Store.setWithTTL('lastRead', {
        surah: params.surah,
        ayah: params.ayah || 1,
        timestamp: Date.now(),
        surahName: uthmaniData.data.englishName
      }, 7 * 24 * 60 * 60 * 1000);
    } catch (error) {
      loader.remove();
      container.appendChild(Utils.createElement('div', { className: 'empty-state' }, [
        Utils.createElement('div', { className: 'empty-state__title' }, 'Failed to Load'),
        Utils.createElement('div', { className: 'empty-state__description' }, 'Could not load surah. Please check your connection.'),
        Utils.createElement('a', { className: 'btn btn--primary', href: '#quran', style: 'margin-top: var(--spacing-xl); display: inline-block;' }, 'Back to Surah List')
      ]));
    }
  }

  function renderSurahContent(container, uthmani, primaryTranslation, highlightAyah = null, allTranslations = []) {
    container.innerHTML = '';

    const breadcrumb = Utils.createElement('div', { className: 'breadcrumb' }, [
      Utils.createElement('a', { className: 'breadcrumb__item', href: '#quran' }, 'Quran'),
      Utils.createElement('span', { className: 'breadcrumb__separator' }, '/'),
      Utils.createElement('span', { className: 'breadcrumb__item' }, uthmani.englishName)
    ]);
    container.appendChild(breadcrumb);

    const surahHeader = Utils.createElement('div', { className: 'card quran-surah-header', style: 'margin-bottom: var(--spacing-xl); text-align: center; position: relative; overflow: hidden;' }, [
      Utils.createElement('div', { className: 'quran-surah-header__bismillah' }, 'بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ'),
      Utils.createElement('h2', { className: 'card__title quran-surah-header__title' }, uthmani.name),
      Utils.createElement('p', { className: 'card__description quran-surah-header__subtitle' }, `${uthmani.englishName} • ${uthmani.englishNameTranslation}`),
      Utils.createElement('p', { className: 'card__description' }, `${uthmani.numberOfAyahs} Ayahs • ${uthmani.revelationType}`)
    ]);
    container.appendChild(surahHeader);

    const searchWrapper = Utils.createElement('div', {
      style: 'display: flex; gap: var(--spacing-sm); margin-bottom: var(--spacing-lg);'
    });
    
    const searchInput = Utils.createElement('input', {
      className: 'input quran-search-input',
      id: 'ayah-search',
      placeholder: 'Search ayah number or text...',
      style: 'flex: 1;'
    });
    
    const goBtn = Utils.createElement('button', {
      className: 'btn btn--primary',
      style: 'padding: var(--spacing-sm) var(--spacing-md);'
    }, 'Go');
    
    searchWrapper.appendChild(searchInput);
    searchWrapper.appendChild(goBtn);
    container.appendChild(searchWrapper);

    const ayahsContainer = Utils.createElement('div', { id: 'ayahs-list' });

    function renderAyahs(filteredAyahs) {
      ayahsContainer.innerHTML = '';
      filteredAyahs.forEach((ayah) => {
        const primaryTrans = primaryTranslation?.ayahs?.find(t => t.numberInSurah === ayah.numberInSurah);
        const isHighlighted = highlightAyah && String(ayah.numberInSurah) === String(highlightAyah);

        const ayahCard = Utils.createElement('div', {
          className: 'card quran-ayah-card',
          id: `ayah-${ayah.numberInSurah}`,
          style: `${isHighlighted ? 'border-color: var(--color-quran); box-shadow: var(--shadow-gold);' : ''}`
        });

        const ayahHeader = Utils.createElement('div', {
          style: 'display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-md); padding-bottom: var(--spacing-sm); border-bottom: 1px solid var(--color-border);'
        }, [
          Utils.createElement('div', { style: 'display: flex; align-items: center; gap: var(--spacing-sm);' }, [
            Utils.createElement('span', { className: 'badge badge--primary quran-ayah-badge' }, `Ayah ${ayah.numberInSurah}`),
            Utils.createElement('button', {
              className: 'btn btn--ghost btn--sm quran-tafsir-btn',
              onClick: () => {
                window.location.hash = `#quran/tafsir/${uthmani.number}/${ayah.numberInSurah}`;
              }
            }, 'Tafsir Ibn Kathir')
          ]),
          Utils.createElement('div', { style: 'display: flex; gap: var(--spacing-xs);' }, [
            Utils.createElement('button', {
              className: 'btn btn--ghost btn--icon',
              title: 'Copy',
              innerHTML: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>',
              onClick: () => copyAyah(ayah, primaryTrans, uthmani)
            }),
            Utils.createElement('button', {
              className: 'btn btn--ghost btn--icon quran-share-btn',
              title: 'Share',
              innerHTML: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><polyline points="16 6 12 2 8 6"></polyline><line x1="12" y1="2" x2="12" y2="15"></line></svg>',
              onClick: () => shareAyah(ayah, primaryTrans, uthmani)
            }),
            Utils.createElement('a', {
              className: 'btn btn--ghost btn--icon',
              title: 'Link',
              href: `#quran/${uthmani.number}/${ayah.numberInSurah}`,
              innerHTML: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>'
            })
          ])
        ]);
        ayahCard.appendChild(ayahHeader);

        const arabicText = Utils.createElement('p', {
          className: 'rtl arab-text quran-arabic',
          innerHTML: ayah.text
        });
        ayahCard.appendChild(arabicText);

        if (primaryTrans?.text) {
          const translationsContainer = Utils.createElement('div', { 
            className: 'quran-translations-container',
            style: 'margin-top: var(--spacing-md);'
          });
          
          const primaryTransDiv = Utils.createElement('p', {
            className: 'card__description quran-translation quran-translation--primary',
            innerHTML: formatTranslation(primaryTrans.text)
          });
          translationsContainer.appendChild(primaryTransDiv);
          
          if (allTranslations && allTranslations.length > 1) {
            allTranslations.slice(1).forEach((transData, idx) => {
              const trans = transData?.data?.ayahs?.find(t => t.numberInSurah === ayah.numberInSurah);
              if (trans?.text) {
                const secTransDiv = Utils.createElement('p', {
                  className: 'card__description quran-translation quran-translation--secondary',
                  style: 'margin-top: var(--spacing-sm); font-size: var(--font-size-sm);',
                  innerHTML: formatTranslation(trans.text)
                });
                translationsContainer.appendChild(secTransDiv);
              }
            });
          }
          
          ayahCard.appendChild(translationsContainer);
        }

        ayahsContainer.appendChild(ayahCard);
      });

      if (highlightAyah) {
        setTimeout(() => {
          const highlighted = document.getElementById(`ayah-${highlightAyah}`);
          if (highlighted) {
            highlighted.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 100);
      }
    }

    renderAyahs(uthmani.ayahs);

    searchInput.addEventListener('input', Utils.debounce((e) => {
      const query = e.target.value.trim();
      
      if (!query) {
        renderAyahs(uthmani.ayahs);
        return;
      }

      const queryLower = query.toLowerCase();
      const isAyahNumber = /^\d+$/.test(query) || /^\d+:\d+$/.test(query);

      let filtered;
      if (isAyahNumber) {
        const ayahNum = parseInt(query.split(':').pop());
        filtered = uthmani.ayahs.filter(ayah => ayah.numberInSurah === ayahNum);
      } else {
        filtered = uthmani.ayahs.filter((ayah) => {
          const primaryTrans = primaryTranslation?.ayahs?.find(t => t.numberInSurah === ayah.numberInSurah);
          return String(ayah.numberInSurah).includes(queryLower) ||
            ayah.text.toLowerCase().includes(queryLower) ||
            primaryTrans?.text?.toLowerCase().includes(queryLower);
        });
      }
      
      if (filtered.length === 0) {
        ayahsContainer.innerHTML = '<div class="empty-state" style="text-align: center; padding: var(--spacing-xl);"><p>No results found for "' + query + '"</p></div>';
      } else {
        renderAyahs(filtered);
      }
    }, 300));

    container.appendChild(ayahsContainer);

    const scrollToTopBtn = Utils.createElement('button', {
      className: 'scroll-to-top',
      innerHTML: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="18 15 12 9 6 15"></polyline></svg>',
      onClick: () => window.scrollTo({ top: 0, behavior: 'smooth' })
    });
    container.appendChild(scrollToTopBtn);
  }

  function openTafsirModal(surahNumber, ayahNumber, surahData, hilaliData) {
    closeTafsirModal();

    const ayah = surahData.ayahs?.find(a => a.numberInSurah == ayahNumber);
    const translation = hilaliData?.ayahs?.find(a => a.numberInSurah == ayahNumber);

    const overlay = Utils.createElement('div', {
      className: 'quran-tafsir-modal-overlay',
      onClick: (e) => {
        if (e.target === overlay) {
          closeTafsirModal();
          window.location.hash = `#quran/${surahNumber}/${ayahNumber}`;
        }
      }
    });

    const modal = Utils.createElement('div', { className: 'quran-tafsir-modal' }, [
      Utils.createElement('div', { className: 'quran-tafsir-modal-header' }, [
        Utils.createElement('div', { className: 'quran-tafsir-modal-title' }, [
          Utils.createElement('span', {}, `Tafsir Ibn Kathir`),
          Utils.createElement('span', { className: 'quran-tafsir-modal-subtitle' }, `${surahData.englishName} - Ayah ${ayahNumber}`)
        ]),
        Utils.createElement('button', {
          className: 'quran-tafsir-modal-close',
          onClick: () => {
            closeTafsirModal();
            window.location.hash = `#quran/${surahNumber}/${ayahNumber}`;
          }
        }, '✕')
      ]),
      Utils.createElement('div', { className: 'quran-tafsir-modal-body' }, [
        ayah ? Utils.createElement('p', {
          className: 'rtl arab-text quran-tafsir-modal-arabic',
          innerHTML: ayah.text
        }) : null,
        translation?.text ? Utils.createElement('p', {
          className: 'quran-tafsir-modal-translation',
          textContent: translation.text
        }) : null,
        Utils.createElement('div', { className: 'quran-tafsir-modal-divider' }),
        Utils.createElement('div', {
          className: 'quran-tafsir-modal-content',
          id: 'tafsir-content'
        }, 'Loading tafsir...')
      ]),
      Utils.createElement('div', { className: 'quran-tafsir-modal-footer' }, [
        Utils.createElement('button', {
          className: 'btn btn--ghost btn--sm',
          onClick: () => copyTafsir(surahData, ayahNumber, translation)
        }, 'Copy'),
        Utils.createElement('button', {
          className: 'btn btn--ghost btn--sm',
          onClick: () => shareTafsirLink(surahNumber, ayahNumber)
        }, 'Share Link'),
        Utils.createElement('button', {
          className: 'btn btn--primary btn--sm',
          onClick: () => {
            closeTafsirModal();
            window.location.hash = `#quran/${surahNumber}/${ayahNumber}`;
          }
        }, 'Close')
      ])
    ]);

    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    currentTafsirModal = overlay;

    loadTafsirContent(surahNumber, ayahNumber);
  }

  function closeTafsirModal() {
    if (currentTafsirModal) {
      currentTafsirModal.remove();
      currentTafsirModal = null;
    }
  }

  async function loadTafsirContent(surahNumber, ayahNumber) {
    const contentDiv = document.getElementById('tafsir-content');
    if (!contentDiv) {
      console.error('tafsir-content element not found');
      return;
    }

    contentDiv.innerHTML = '';
    contentDiv.appendChild(Utils.createElement('div', { className: 'loader' }, [
      Utils.createElement('div', { className: 'loader__spinner loader-spinner-gold' }),
      Utils.createElement('span', {}, 'Loading tafsir...')
    ]));

    try {
      console.log(`Loading tafsir for ${surahNumber}:${ayahNumber}...`);
      console.log('TafsirApi object:', TafsirApi);
      console.log('TafsirApi.getVerseTafsir type:', typeof TafsirApi?.getVerseTafsir);
      const tafsir = await TafsirApi.getVerseTafsir(surahNumber, ayahNumber);
      console.log('Tafsir API response:', tafsir);
      contentDiv.innerHTML = '';

      if (tafsir?.text) {
        const formatted = formatTafsirText(tafsir.text);
        contentDiv.innerHTML = formatted;
      } else {
        contentDiv.appendChild(Utils.createElement('p', { style: 'color: var(--color-text-secondary); text-align: center;' }, 'Tafsir not available for this ayah.'));
      }
    } catch (error) {
      console.error('Tafsir load error:', error);
      contentDiv.innerHTML = '';
      contentDiv.appendChild(Utils.createElement('p', { style: 'color: var(--color-danger); text-align: center;' }, 'Failed to load tafsir: ' + error.message));
    }
  }

  function formatTafsirText(text) {
    if (!text) return '';
    let formatted = text
      .replace(/<h1>/gi, '<h1 class="quran-tafsir-h1">')
      .replace(/<h2>/gi, '<h2 class="quran-tafsir-h2">')
      .replace(/<h3>/gi, '<h3 class="quran-tafsir-h3">')
      .replace(/<p>/gi, '<p class="quran-tafsir-p">');
    return formatted;
  }

  function copyTafsir(surahData, ayahNumber, translation) {
    const contentDiv = document.getElementById('tafsir-content');
    if (!contentDiv) return;

    const textToCopy = `Tafsir Ibn Kathir - ${surahData.englishName} Ayah ${ayahNumber}\n\n${translation?.text || ''}\n\n${contentDiv.textContent || ''}`;

    navigator.clipboard.writeText(textToCopy).then(() => {
      Utils.showToast('Tafsir copied to clipboard!');
    }).catch(() => {
      Utils.showToast('Failed to copy text', 'error');
    });
  }

  function shareTafsirLink(surahNumber, ayahNumber) {
    const url = `${window.location.origin}${window.location.pathname}#quran/tafsir/${surahNumber}/${ayahNumber}`;
    navigator.clipboard.writeText(url).then(() => {
      Utils.showToast('Link copied to clipboard!');
    }).catch(() => {
      Utils.showToast('Failed to copy link', 'error');
    });
  }

  function copyAyah(ayah, translation, surah) {
    const textToCopy = `${surah.englishName} ${ayah.numberInSurah}\n\n${ayah.text}\n\n${translation?.text || ''}\n\n- salafInit`;
    navigator.clipboard.writeText(textToCopy).then(() => {
      Utils.showToast('Ayah copied to clipboard!');
    }).catch(() => {
      Utils.showToast('Failed to copy', 'error');
    });
  }

  async function shareAyah(ayah, translation, surah) {
    const existingModal = document.querySelector('.quran-share-modal');
    if (existingModal) existingModal.remove();

    const template = Utils.createElement('div', {
      className: 'quran-share-template',
      style: 'padding: 24px; background: linear-gradient(135deg, #161423 0%, #201D33 50%, #2A2647 100%); border: 2px solid #A277FF; border-radius: 12px; max-width: 600px; max-height: calc(100vh - 180px); color: #E0DEF4; overflow-y: auto;'
    }, [
      Utils.createElement('p', {
        style: 'font-size: 12px; color: #80FFEA; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 2px;'
      }, `${surah.englishName} - Ayah ${ ayah.numberInSurah}`),
      Utils.createElement('p', {
        className: 'rtl arab-text',
        style: 'font-size: 24px; line-height: 2; margin-bottom: 16px; color: #F6C177; text-align: center; font-family: var(--font-arabic);'
      }, ayah.text),
      translation?.text ? Utils.createElement('p', {
        style: 'font-size: 14px; line-height: 1.6; color: #908CAA; margin-bottom: 16px; text-align: center;'
      }, `"${translation.text}"`) : null,
      Utils.createElement('div', { style: 'display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #322D4A; padding-top: 12px; font-size: 12px; color: #6E6A86; flex-shrink: 0;' }, [
        Utils.createElement('span', {}, `${surah.englishName} ${ayah.numberInSurah}`),
        Utils.createElement('span', { style: 'color: #A277FF;' }, 'salaf.Init();')
      ])
    ]);

    const closeShareModal = () => {
      document.querySelector('.quran-share-modal')?.remove();
      document.body.style.overflow = '';
    };

    const modal = Utils.createElement('div', {
      className: 'quran-share-modal',
      style: 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.9); z-index: 9999; padding: 80px 20px 100px; display: flex; flex-direction: column; justify-content: flex-start; align-items: center; overflow-y: auto; -webkit-overflow-scrolling: touch;'
    }, [
      template,
      Utils.createElement('div', { style: 'margin-top: 20px; display: flex; gap: 10px; flex-shrink: 0; z-index: 10;' }, [
        Utils.createElement('button', {
          className: 'btn btn--primary',
          onClick: () => generateShareImage(template, ayah, surah)
        }, 'Download Image'),
        Utils.createElement('button', {
          className: 'btn btn--outline',
          onClick: closeShareModal
        }, 'Close')
      ])
    ]);
    
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeShareModal();
    });
    
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
  }

  async function generateShareImage(template, ayah, surah) {
    try {
      if (typeof snapdom !== 'undefined') {
        const img = await snapdom.toPng(template, { scale: 2 });
        const a = document.createElement('a');
        a.href = img.src;
        a.download = `quran-${surah.number}-${ayah.numberInSurah}.png`;
        a.click();
        Utils.showToast('Image downloaded!');
      } else {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = template.offsetWidth;
        canvas.height = template.offsetHeight;

        try {
          const svgData = `
            <svg xmlns="http://www.w3.org/2000/svg" width="${template.offsetWidth}" height="${template.offsetHeight}">
              <foreignObject width="100%" height="100%">
                <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: sans-serif;">
                  ${template.outerHTML}
                </div>
              </foreignObject>
            </svg>
          `;
          const img = new Image();
          img.onload = () => {
            ctx.drawImage(img, 0, 0);
            const link = document.createElement('a');
            link.download = `quran-${surah.number}-${ayah.numberInSurah}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
            Utils.showToast('Image downloaded!');
          };
          img.src = 'data:image/svg+xml,' + encodeURIComponent(svgData);
        } catch (err) {
          console.error('SVG fallback error:', err);
          Utils.showToast('Image generation not supported in this browser', 'error');
        }
      }
    } catch (error) {
      console.error('Share image error:', error);
      Utils.showToast('Failed to generate image', 'error');
    }
  }

  return { render };
})();
