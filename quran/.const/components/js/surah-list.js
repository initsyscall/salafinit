import { formatTranslation } from './utils.js';
import { highlightText, parseSearchQuery } from './utils.js';
import QuranConfig from './config.js';

let surahs = [];
let currentSearchQuery = '';
let currentPage = 1;
let allMatches = [];
let hasMoreResults = false;

function createLoader() {
  return Utils.createElement('div', { className: 'loader' }, [
    Utils.createElement('div', { className: 'loader__spinner loader-spinner-gold' }),
    Utils.createElement('span', { className: 'loader__text' }, QuranConfig.LABELS.LOADING_SURAHS)
  ]);
}

function createErrorState() {
  return Utils.createElement('div', { className: 'empty-state' }, [
    Utils.createElement('div', { className: 'empty-state__title' }, QuranConfig.LABELS.FAILED_TO_LOAD),
    Utils.createElement('div', { className: 'empty-state__description' }, QuranConfig.LABELS.COULD_NOT_LOAD_SURAHLIST)
  ]);
}

function createSearchRow() {
  const searchRow = Utils.createElement('div', { style: 'margin-bottom: var(--spacing-lg); display: flex; gap: var(--spacing-sm); align-items: stretch;' }, [
    Utils.createElement('input', {
      className: 'input quran-search-input',
      id: 'surah-search',
      placeholder: QuranConfig.LABELS.SEARCH_PLACEHOLDER,
      style: 'flex: 1;'
    }),
    Utils.createElement('button', {
      className: 'btn btn--primary quran-search-btn',
      id: 'search-btn',
      style: 'white-space: nowrap;'
    }, QuranConfig.LABELS.SEARCH_BTN)
  ]);
  return searchRow;
}

function createResultsContainer() {
  return Utils.createElement('div', {
    id: 'global-search-results',
    style: 'display: none; margin-bottom: var(--spacing-lg);'
  });
}

function createSurahCard(surah) {
  const isMeccan = surah.revelationType === 'Meccan';
  const badgeClass = isMeccan ? 'badge badge--Meccan' : 'badge badge--Madinah';
  return Utils.createElement('a', {
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
}

function renderGrid(grid, filteredSurahs) {
  grid.innerHTML = '';
  filteredSurahs.forEach((surah) => {
    grid.appendChild(createSurahCard(surah));
  });
}

function renderSearchResults(resultsDiv, matches, total, hasMore) {
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
    loadMoreBtn.className = 'btn btn--primary load-more-btn';
    loadMoreBtn.style.cssText = 'margin-top:var(--spacing-md);width:100%;';
    loadMoreBtn.textContent = 'Load More Results';
    loadMoreBtn.onclick = () => loadMoreResults(resultsDiv);
    resultsDiv.appendChild(loadMoreBtn);
  }
}

async function loadMoreResults(resultsDiv) {
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

function handleSearch(searchInput, resultsDiv, grid) {
  return function() {
    const query = searchInput.value.trim();
    if (!query) return;

    const parsed = parseSearchQuery(query);

    if (parsed.type === 'ayah') {
      window.location.hash = `#quran/${parsed.surah}/${parsed.ayah}`;
    } else if (parsed.type === 'surah') {
      window.location.hash = `#quran/${parsed.surah}`;
    } else {
      resultsDiv.style.display = 'none';
      renderGrid(grid, surahs.filter(s =>
        s.englishName.toLowerCase().includes(query.toLowerCase()) ||
        s.englishNameTranslation.toLowerCase().includes(query.toLowerCase()) ||
        String(s.number).includes(query) ||
        s.name.toLowerCase().includes(query.toLowerCase())
      ));

      currentSearchQuery = '';
      currentPage = 1;
      allMatches = [];
      hasMoreResults = false;

      QuranApi.search(query).then(searchResults => {
        const data = searchResults?.data;
        if (data && data.matches && data.matches.length > 0) {
          currentSearchQuery = query;
          currentPage = 1;
          allMatches = data.matches;
          hasMoreResults = data.hasMore || false;

          renderSearchResults(resultsDiv, allMatches, data.total || data.matches.length, hasMoreResults);
        } else {
          resultsDiv.innerHTML = '';
          resultsDiv.style.display = 'block';
          resultsDiv.appendChild(Utils.createElement('p', { style: 'font-size: var(--font-size-sm); color: var(--color-text-secondary);' }, `No results found for "${query}". Try a different search.`));
        }
      }).catch(err => {
        console.error('Global search error:', err);
      });
    }
  };
}

export async function renderSurahList(container) {
  const loader = createLoader();
  container.appendChild(loader);

  try {
    const data = await QuranApi.getSurahList();
    loader.remove();

    surahs = data.data || [];

    const searchRow = createSearchRow();
    container.appendChild(searchRow);

    const resultsDiv = createResultsContainer();
    container.appendChild(resultsDiv);

    const grid = Utils.createElement('div', { id: 'surah-grid', className: 'grid grid--responsive' });
    renderGrid(grid, surahs);
    container.appendChild(grid);

    const searchInput = document.getElementById('surah-search');
    const searchBtn = document.getElementById('search-btn');

    searchBtn.addEventListener('click', handleSearch(searchInput, resultsDiv, grid));

    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        handleSearch(searchInput, resultsDiv, grid)();
      }
    });

  } catch (error) {
    loader.remove();
    container.appendChild(createErrorState());
  }
}

export default { renderSurahList };