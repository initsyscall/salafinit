const SalafiyyahView = (() => {
  async function render(container) {
    container.innerHTML = '';
    const page = Utils.createElement('div', { className: 'salf-page' });
    container.appendChild(page);

    const header = Utils.createElement('div', { className: 'salf-header' });
    header.innerHTML = `
      <h1 class="salf-header__title">ٱلسَّلَفِيَّةُ</h1>
      <p class="salf-header__sub">Salafiyyah is the luminous path of the Prophet and his Companions; a return to the pure spring of Revelation, unclouded by innovation, seeking Allah's pleasure through the Truth.</p>
    `;
    page.appendChild(header);

    const cards = Utils.createElement('div', { className: 'salf-cards' });
    cards.appendChild(createCard(
      'أسماء الله الحسنى',
      'Asma ul Husna',
      'The 99 Beautiful Names of Allah',
      '#learn/salafiyyah/asmaulhusna'
    ));
    page.appendChild(cards);
  }

  function createCard(arabic, title, desc, href) {
    return Utils.createElement('a', { className: 'salf-card', href }, [
      Utils.createElement('div', { className: 'salf-card__arabic' }, arabic),
      Utils.createElement('div', { className: 'salf-card__title' }, title),
      Utils.createElement('div', { className: 'salf-card__desc' }, desc)
    ]);
  }

  async function renderAsma(container, params) {
    container.innerHTML = '';

    const page = Utils.createElement('div', { className: 'asma-page' });
    container.appendChild(page);

    const top = Utils.createElement('div', { className: 'asma-top' });
    top.innerHTML = `
      <a class="asma-top__back" href="#learn/salafiyyah">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        Salafiyyah
      </a>
    `;
    page.appendChild(top);

    const searchInput = Utils.createElement('input', {
      className: 'asma-search',
      type: 'text',
      placeholder: 'Search a name…',
      autocomplete: 'off'
    });
    page.appendChild(searchInput);

    const wrapper = Utils.createElement('div', { className: 'asma-wrapper' });
    page.appendChild(wrapper);

    const loader = Utils.createElement('div', { className: 'loader' }, [
      Utils.createElement('div', { className: 'loader__spinner' }),
      Utils.createElement('span', { className: 'loader__text' }, 'Loading…')
    ]);
    wrapper.appendChild(loader);

    try {
      const data = await ApiClient.fetchApi('https://ummahapi.com/api/asma-ul-husna');
      const names = data.data.names;
      if (!names || names.length !== 99) throw new Error('Invalid data');

      const scrollContainer = Utils.createElement('div', { className: 'asma-scroll' });

      names.forEach((n, i) => {
        const id = n.transliteration.toLowerCase().replace(/[^a-z0-9-]/g, '-');
        const card = Utils.createElement('div', { className: 'asma-card', id });
        const content = Utils.createElement('div', { className: 'asma-card__content' });
        content.innerHTML = `
          <span class="asma-card__number">${String(n.number).padStart(2, '0')}</span>
          <h2 class="asma-card__arabic">${n.arabic}</h2>
          <p class="asma-card__trans">${n.transliteration}</p>
          <p class="asma-card__meaning">${n.meaning}</p>
        `;

        const actions = Utils.createElement('div', { className: 'asma-actions asma-card-exclude' });
        const actionDefs = [
          { action: 'copy', title: 'Copy', svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>' },
          { action: 'image', title: 'Share Image', svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>' },
          { action: 'link', title: 'Copy Link', svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>' }
        ];
        actionDefs.forEach(def => {
          const btn = Utils.createElement('button', {
            className: 'asma-action-btn',
            title: def.title,
            'data-action': def.action,
            'data-name': n.transliteration,
            'data-arabic': n.arabic,
            'data-meaning': n.meaning
          });
          btn.innerHTML = def.svg;
          actions.appendChild(btn);
        });
        card.appendChild(Utils.createElement('div', { className: 'asma-card__bg' }));
        card.appendChild(content);
        card.appendChild(actions);
        scrollContainer.appendChild(card);
      });

      // Search filter
      searchInput.addEventListener('input', () => {
        const q = searchInput.value.toLowerCase().trim();
        if (!q) {
          scrollContainer.querySelectorAll('.asma-card').forEach(c => c.style.display = '');
          return;
        }
        let firstMatch = null;
        scrollContainer.querySelectorAll('.asma-card').forEach(c => {
          const id = c.id;
          const text = c.textContent.toLowerCase();
          const match = id.includes(q) || text.includes(q);
          c.style.display = match ? '' : 'none';
          if (match && !firstMatch) firstMatch = c;
        });
        if (firstMatch) firstMatch.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });

      // Action button delegation
      scrollContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('.asma-action-btn');
        if (!btn) return;
        const card = btn.closest('.asma-card');
        const name = btn.dataset.name;
        const action = btn.dataset.action;
        if (action === 'copy') copyName(btn, card);
        else if (action === 'image') shareNameImage(btn, card);
        else if (action === 'link') copyNameLink(name);
      });

      loader.remove();
      wrapper.appendChild(scrollContainer);

      setTimeout(() => {
        scrollContainer.dispatchEvent(new Event('scroll'));
        if (params && params.name) scrollToName(scrollContainer, params.name);
      }, 100);
    } catch (err) {
      console.error('Failed to load Asma ul Husna:', err);
      loader.remove();
      wrapper.appendChild(Utils.createElement('div', { className: 'empty-state' }, [
        Utils.createElement('div', { className: 'empty-state__title' }, 'Unable to Load'),
        Utils.createElement('div', { className: 'empty-state__description' }, 'Could not fetch the 99 Names. Please try again.')
      ]));
    }
  }

  function scrollToName(container, name) {
    const q = name.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    const target = container.querySelector(`#${CSS.escape(q)}`);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      target.style.setProperty('--asma-highlight', '1');
    }
  }

  function copyName(btn, card) {
    const arabic = card.querySelector('.asma-card__arabic')?.textContent || '';
    const trans = card.querySelector('.asma-card__trans')?.textContent || '';
    const num = card.querySelector('.asma-card__number')?.textContent || '';
    const text = `${num}. ${arabic} — ${trans}\n\n“${card.querySelector('.asma-card__meaning')?.textContent || ''}”`;
    navigator.clipboard.writeText(text).then(() => {
      const orig = btn.innerHTML;
      btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>';
      setTimeout(() => { btn.innerHTML = orig; }, 2000);
    });
  }

  async function shareNameImage(btn, card) {
    try {
      if (typeof snapdom === 'undefined') { Utils.showToast('Image capture not available'); return; }
      const origBg = card.style.background;
      const bg = getComputedStyle(document.body).getPropertyValue('--color-bg').trim();
      card.style.background = bg || '#000';
      card.classList.add('asma-capturing');
      const img = await snapdom.toPng(card, { scale: 2 });
      card.classList.remove('asma-capturing');
      card.style.background = origBg;
      const a = document.createElement('a');
      a.href = img.src;
      a.download = `asma-ul-husna-${card.id || 'name'}.png`;
      a.click();
      Utils.showToast('Image downloaded!');
    } catch (err) {
      card.classList.remove('asma-capturing');
      card.style.background = origBg;
      Utils.showToast('Failed to generate image');
    }
  }

  function copyNameLink(name) {
    const url = `${window.location.origin}${window.location.pathname}#learn/salafiyyah/asmaulhusna/${name.toLowerCase().replace(/[^a-z0-9-]/g, '-')}`;
    navigator.clipboard.writeText(url).then(() => Utils.showToast('Link copied!'));
  }

  return { render, renderAsma };
})();

window.SalafiyyahView = SalafiyyahView;
