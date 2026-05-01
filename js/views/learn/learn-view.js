const LearnView = (() => {
  async function render(container) {
    container.innerHTML = '';

    const header = Utils.createElement('div', { className: 'page-header' }, [
      Utils.createElement('h1', { className: 'page-header__title' }, 'Study Resources'),
      Utils.createElement('p', { className: 'page-header__subtitle' }, 'Download Islamic books and study materials')
    ]);
    container.appendChild(header);

    const content = Utils.createElement('div', { id: 'learn-content' });
    container.appendChild(content);

    loadBooks(content);
  }

  async function loadBooks(container) {
    container.innerHTML = `
      <div class="loader">
        <div class="loader__spinner"></div>
        <span class="loader__text">Loading books...</span>
      </div>
    `;

    try {
      const response = await fetch('./data/books.json');
      if (!response.ok) throw new Error('Failed to load books.json');

      const data = await response.json();
      renderBooks(container, data);
    } catch (error) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state__icon">📚</div>
          <div class="empty-state__title">No Books Available</div>
          <div class="empty-state__description">
            Books will be available once they are added to the repository.
            Check back later for updates.
          </div>
        </div>
      `;
    }
  }

  function renderBooks(container, books) {
    const grid = Utils.createElement('div', { className: 'grid grid--responsive' });

    books.forEach((book) => {
      const card = Utils.createElement('div', { className: 'card' });

      const title = Utils.createElement('h3', { className: 'card__title' }, book.title);
      card.appendChild(title);

      if (book.author) {
        const author = Utils.createElement('p', {
          className: 'card__description',
          style: 'margin-bottom: var(--spacing-sm);'
        }, `By ${book.author}`);
        card.appendChild(author);
      }

      if (book.description) {
        const desc = Utils.createElement('p', { className: 'card__description' }, book.description);
        card.appendChild(desc);
      }

      if (book.category) {
        const badge = Utils.createElement('span', {
          className: 'badge badge--primary',
          style: 'margin: var(--spacing-sm) 0;'
        }, book.category);
        card.appendChild(badge);
      }

      if (book.downloadUrl) {
        const link = Utils.createElement('a', {
          className: 'btn btn--primary btn--full',
          style: 'margin-top: var(--spacing-md);',
          href: book.downloadUrl,
          download: '',
          target: '_blank',
          rel: 'noopener noreferrer'
        }, 'Download');
        card.appendChild(link);
      }

      grid.appendChild(card);
    });

    container.appendChild(grid);
  }

  return { render };
})();
