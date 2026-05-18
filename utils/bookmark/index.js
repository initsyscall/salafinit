const Bookmark = (() => {
  function render(container) {
    container.innerHTML = `
      <div class="empty-state" style="min-height: 60vh; display: flex; flex-direction: column; align-items: center; justify-content: center;">
        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#F472C6" stroke-width="1.5" style="margin-bottom: var(--spacing-lg); opacity: 0.8;">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
        </svg>
        <h2 class="empty-state__title" style="color: var(--color-text);">Coming Soon</h2>
        <p class="empty-state__description" style="max-width: 400px; text-align: center;">
          Bookmark feature is under development. Save your favorite hadiths, verses, and notes for later.
        </p>
      </div>
    `;
  }

  return { render };
})();