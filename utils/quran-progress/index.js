window.QuranProgress = (() => {
  const STORAGE_KEY = 'quran-reading-progress';
  const TOTAL_AYAHS = QuranProgressSurahs.reduce((s, su) => s + su.a, 0);
  let scrollHandler;

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return { khatmat: [] };
  }

  function save(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function getActiveKhatm(data) {
    if (!data.khatmat.length) return null;
    let active = data.khatmat.find(k => !k.completedAt);
    if (!active) active = data.khatmat[data.khatmat.length - 1];
    return active;
  }

  function newKhatm(data) {
    const k = { id: Date.now(), startedAt: Date.now(), completedAt: null, progress: {} };
    data.khatmat.push(k);
    save(data);
    return k;
  }

  function updateProgress(data, khatmId, surahNum, ayah) {
    const k = data.khatmat.find(x => x.id === khatmId);
    if (!k) return;
    if (ayah <= 0) {
      delete k.progress[surahNum];
    } else {
      k.progress[surahNum] = ayah;
    }
    const allComplete = QuranProgressSurahs.every(s => (k.progress[s.n] || 0) >= s.a);
    if (allComplete) k.completedAt = Date.now();
    save(data);
  }

  function getSurahProgress(k, surahNum) {
    return k.progress[surahNum] || 0;
  }

  function getKhatmStats(k) {
    let totalRead = 0;
    let completed = 0;
    QuranProgressSurahs.forEach(s => {
      const read = k.progress[s.n] || 0;
      totalRead += Math.min(read, s.a);
      if (read >= s.a) completed++;
    });
    const pct = (totalRead / TOTAL_AYAHS) * 100;
    return { totalRead, completed, total: QuranProgressSurahs.length, pct };
  }

  function getJuzData() {
    const result = [];
    for (let i = 0; i < QuranProgressJuz.length; i++) {
      const curr = QuranProgressJuz[i];
      const next = QuranProgressJuz[i + 1];
      let idx = curr.s - 1;
      const surahs = [];
      let total = 0;
      while (idx < QuranProgressSurahs.length) {
        const s = QuranProgressSurahs[idx];
        const start = s.n === curr.s ? curr.a : 1;
        let end = s.a;
        if (next && s.n === next.s) end = next.a - 1;
        const count = end - start + 1;
        if (count > 0) {
          surahs.push({ ...s, startAyah: start, endAyah: end, count });
          total += count;
        }
        if (next && s.n >= next.s) break;
        idx++;
      }
      result.push({ juz: curr.j, totalAyahs: total, surahs });
    }
    return result;
  }

  function getJuzProgress(k, juzEntry) {
    let read = 0;
    juzEntry.surahs.forEach(s => {
      const p = k.progress[s.n] || 0;
      read += Math.max(0, Math.min(p, s.endAyah) - s.startAyah + 1);
    });
    return read;
  }

  function render(container) {
    container.innerHTML = '';
    const page = document.createElement('div');
    page.className = 'qp-page';

    const data = load();
    let khatm = getActiveKhatm(data);
    if (!khatm) {
      khatm = newKhatm(data);
    }
    const stats = getKhatmStats(khatm);

    /* Header */
    const h = document.createElement('div');
    h.className = 'qp-header';
    h.innerHTML = `
      <button class="bm-back" onclick="window.location.hash='#utils'">← Back</button>
      <h1 class="qp-title">Reading Progress</h1>
    `;
    page.appendChild(h);

    /* Stats bar */
    const RESET_SVG = '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>';

    const sb = document.createElement('div');
    sb.className = 'qp-stats';
    const pctLabel = document.createElement('div');
    pctLabel.className = 'qp-pct';
    pctLabel.textContent = stats.pct.toFixed(2) + '%';
    const barOuter = document.createElement('div');
    barOuter.className = 'qp-bar';
    const barInner = document.createElement('div');
    barInner.className = 'qp-bar__fill';
    barInner.style.width = stats.pct + '%';
    barOuter.appendChild(barInner);
    sb.appendChild(pctLabel);
    sb.appendChild(barOuter);

    const info = document.createElement('div');
    info.className = 'qp-info';
    const isComplete = khatm.completedAt;
    if (isComplete) {
      info.innerHTML = `<span>Khatm completed <span class="qp-check">✓</span></span>`;
    } else {
      info.innerHTML = `<span>${stats.completed}/${stats.total} surahs</span><span>${stats.totalRead.toLocaleString()}/${TOTAL_AYAHS.toLocaleString()} ayahs <span class="qp-reset-all">${RESET_SVG}</span></span>`;
    }
    sb.appendChild(info);

    let resetAllLast = 0;
    const resetAllEl = info.querySelector('.qp-reset-all');
    resetAllEl?.addEventListener('click', (e) => {
      const el = e.currentTarget;
      el.classList.add('qp-glow');
      setTimeout(() => { if (el.isConnected) el.classList.remove('qp-glow'); }, 500);
      const now = Date.now();
      if (now - resetAllLast < 500) {
        resetAllLast = 0;
        khatm.progress = {};
        khatm.completedAt = null;
        save(data);
        render(container);
      } else {
        resetAllLast = now;
      }
    });

    const khatmLabel = document.createElement('div');
    khatmLabel.className = 'qp-khatm-label';
    const khatmIdx = data.khatmat.indexOf(khatm);
    khatmLabel.textContent = `Khatm #${khatmIdx + 1}` + (stats.completed === stats.total ? ' — Complete!' : '');
    sb.appendChild(khatmLabel);

    if (isComplete) {
      const newBtn = document.createElement('button');
      newBtn.className = 'qp-new-btn';
      newBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg> New Khatm';
      newBtn.addEventListener('click', () => { newKhatm(data); render(container); });
      sb.appendChild(newBtn);
    }

    page.appendChild(sb);

    /* Khatm history */
    if (data.khatmat.length > 1) {
      const hist = document.createElement('div');
      hist.className = 'qp-history';
      const histLabel = document.createElement('div');
      histLabel.className = 'qp-history__label';
      histLabel.textContent = 'Previous khatmat';
      hist.appendChild(histLabel);
      data.khatmat.forEach((k, i) => {
        if (k.id === khatm.id) return;
        const s = getKhatmStats(k);
        const item = document.createElement('button');
        item.className = 'qp-history__item';
        item.innerHTML = `<span>Khatm #${i + 1}</span><span>${s.pct.toFixed(2)}%</span>`;
        item.addEventListener('click', () => {
          khatm = k;
          render(container);
        });
        hist.appendChild(item);
      });
      page.appendChild(hist);
    }

    /* Juz sections */
    const juzData = getJuzData();
    const list = document.createElement('div');
    list.className = 'qp-list';

    juzData.forEach(jd => {
      const readAyahs = getJuzProgress(khatm, jd);
      const juzPct = (readAyahs / jd.totalAyahs) * 100;

      const section = document.createElement('div');
      section.className = 'qp-juz qp-juz--open';

      const header = document.createElement('div');
      header.className = 'qp-juz__header';
      header.innerHTML = `
        <span class="qp-juz__num">Juz ${jd.juz}</span>
        <span class="qp-juz__pct">${juzPct.toFixed(1)}%</span>
        <span class="qp-juz__bar"><span class="qp-juz__fill" style="width:${juzPct}%"></span></span>
        <span class="qp-juz__reset" title="Double-tap to reset this juz">${RESET_SVG}</span>
      `;
      header.addEventListener('click', (e) => {
        if (e.target.closest('.qp-juz__reset')) return;
        section.classList.toggle('qp-juz--open');
      });
      section.appendChild(header);

      let juzResetLast = 0;
      const juzResetEl = header.querySelector('.qp-juz__reset');
      juzResetEl.addEventListener('click', (e) => {
        e.stopPropagation();
        const el = e.currentTarget;
        el.classList.add('qp-glow');
        setTimeout(() => { if (el.isConnected) el.classList.remove('qp-glow'); }, 500);
        const now = Date.now();
        if (now - juzResetLast < 500) {
          juzResetLast = 0;
          jd.surahs.forEach(s => {
            delete khatm.progress[s.n];
          });
          khatm.completedAt = null;
          save(data);
          render(container);
        } else {
          juzResetLast = now;
        }
      });

      const body = document.createElement('div');
      body.className = 'qp-juz__body';

      jd.surahs.forEach(s => {
        const read = getSurahProgress(khatm, s.n);
        const effectiveRead = Math.max(0, Math.min(read, s.endAyah) - s.startAyah + 1);
        const complete = effectiveRead >= s.count;
        const partial = effectiveRead > 0 && !complete;

        const item = document.createElement('button');
        item.className = 'qp-surah' + (complete ? ' qp-surah--done' : partial ? ' qp-surah--partial' : '');

        const num = document.createElement('span');
        num.className = 'qp-surah__num';
        num.textContent = String(s.n).padStart(3, '0');

        const name = document.createElement('span');
        name.className = 'qp-surah__name';
        name.textContent = s.e + (s.count < s.a ? ` (${s.startAyah}-${s.endAyah})` : '');

        const meta = document.createElement('span');
        meta.className = 'qp-surah__meta';

        if (complete) {
          meta.innerHTML = '<span class="qp-surah__check">✓</span>';
        } else if (partial) {
          meta.textContent = effectiveRead + '/' + s.count;
        } else {
          meta.textContent = s.count + ' ayahs';
        }

        item.appendChild(num);
        item.appendChild(name);
        item.appendChild(meta);

        const bar = document.createElement('div');
        bar.className = 'qp-surah__bar';
        const fill = document.createElement('div');
        fill.className = 'qp-surah__bar-fill';
        fill.style.width = complete ? '100%' : (effectiveRead / s.count * 100) + '%';
        bar.appendChild(fill);
        item.appendChild(bar);

        item.addEventListener('click', () => showSurahDialog(s, read, khatm, data, container));
        body.appendChild(item);
      });

      section.appendChild(body);
      list.appendChild(section);
    });
    page.appendChild(list);

    container.appendChild(page);

    const scrollBtn = document.createElement('button');
    scrollBtn.className = 'scroll-to-top';
    scrollBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="18 15 12 9 6 15"></polyline></svg>';
    scrollBtn.style.display = 'none';
    scrollBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    container.appendChild(scrollBtn);

    if (scrollHandler) window.removeEventListener('scroll', scrollHandler);
    scrollHandler = () => {
      scrollBtn.style.display = window.scrollY > 300 ? '' : 'none';
    };
    window.addEventListener('scroll', scrollHandler, { passive: true });
    scrollHandler();
  }

  function showSurahDialog(surah, currentRead, khatm, data, container) {
    const overlay = document.createElement('div');
    overlay.className = 'qp-overlay';
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });

    const card = document.createElement('div');
    card.className = 'qp-dialog';

    card.innerHTML = `
      <h3 class="qp-dialog__title">${surah.n}. ${surah.e}</h3>
      <p class="qp-dialog__info">${surah.a} ayahs · ${surah.r}</p>
      <div class="qp-dialog__row">
        <label class="qp-dialog__label">Last ayah read</label>
        <input type="number" class="qp-dialog__input" min="0" max="${surah.a}" value="${currentRead || ''}" placeholder="0-${surah.a}">
      </div>
      <div class="qp-dialog__actions">
        <button class="qp-dialog__btn qp-dialog__btn--cancel">Cancel</button>
        <button class="qp-dialog__btn qp-dialog__btn--save">${currentRead >= surah.a ? 'Mark incomplete' : 'Save'}</button>
      </div>
    `;

    const input = card.querySelector('.qp-dialog__input');
    input.focus();
    input.select();

    const saveBtn = card.querySelector('.qp-dialog__btn--save');
    const cancelBtn = card.querySelector('.qp-dialog__btn--cancel');

    function submit() {
      const val = parseInt(input.value);
      if (isNaN(val) || val < 0) { input.focus(); input.select(); return; }
      updateProgress(data, khatm.id, surah.n, Math.min(val, surah.a));
      overlay.remove();
      render(container);
    }

    saveBtn.addEventListener('click', submit);
    cancelBtn.addEventListener('click', () => overlay.remove());
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') submit();
      else if (e.key === 'Escape') overlay.remove();
    });

    overlay.appendChild(card);
    document.body.appendChild(overlay);
  }

  return { render };
})();
