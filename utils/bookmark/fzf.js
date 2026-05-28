window.FZF = window.FZF || (() => {
  function show({ placeholder, items, onSelect }) {
    const overlay = document.createElement('div');
    overlay.className = 'fzf-overlay';

    const modal = document.createElement('div');
    modal.className = 'fzf-modal';

    const input = document.createElement('input');
    input.className = 'fzf-input';
    input.placeholder = placeholder || 'Search…';
    input.autofocus = true;

    const list = document.createElement('div');
    list.className = 'fzf-list';

    modal.appendChild(input);
    modal.appendChild(list);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    let focusedIdx = -1;

    function render(query) {
      const q = query.toLowerCase().trim();
      const filtered = q ? items.filter(i => i.searchText.toLowerCase().includes(q)) : items;
      list.innerHTML = '';
      filtered.forEach((item, idx) => {
        const el = document.createElement('button');
        el.className = 'fzf-item';
        if (idx === focusedIdx) el.classList.add('fzf-item--focused');
        el.innerHTML = highlight(item.label, q);
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          onSelect(item);
          close();
        });
        el.addEventListener('mouseenter', () => {
          focusedIdx = idx;
          render(query);
        });
        list.appendChild(el);
      });
      if (filtered.length === 0) {
        list.innerHTML = '<p class="fzf-empty">No results</p>';
      }
    }

    input.addEventListener('input', () => {
      focusedIdx = 0;
      render(input.value);
    });

    input.addEventListener('keydown', (e) => {
      const items = list.querySelectorAll('.fzf-item');
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        focusedIdx = Math.min(focusedIdx + 1, items.length - 1);
        render(input.value);
        items[focusedIdx]?.scrollIntoView({ block: 'nearest' });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        focusedIdx = Math.max(focusedIdx - 1, 0);
        render(input.value);
        items[focusedIdx]?.scrollIntoView({ block: 'nearest' });
      } else if (e.key === 'Enter' && focusedIdx >= 0 && items[focusedIdx]) {
        e.preventDefault();
        items[focusedIdx].click();
      } else if (e.key === 'Escape') {
        close();
      }
    });

    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
    input.focus();
    render('');

    function close() { overlay.remove(); }
  }

  function highlight(text, query) {
    if (!query) return text;
    const idx = text.toLowerCase().indexOf(query);
    if (idx === -1) return text;
    return text.slice(0, idx) + '<mark>' + text.slice(idx, idx + query.length) + '</mark>' + text.slice(idx + query.length);
  }

  return { show };
})();
