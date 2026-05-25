const SalahView = (() => {
  let timerInterval = null;
  let lastLocation = null;

  const ARABIC_NAMES = { fajr: 'الفجر', sunrise: 'الشروق', dhuhr: 'الظهر', asr: 'العصر', maghrib: 'المغرب', isha: 'العشاء' };
  const PRAYER_ORDER = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];

  function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  async function render(container) {
    container.innerHTML = '';
    const page = Utils.createElement('div', { className: 'salah-page' });
    container.appendChild(page);
    loadTimings(page);
  }

  async function loadTimings(container) {
    const loader = Utils.createElement('div', { className: 'loader' }, [
      Utils.createElement('div', { className: 'loader__spinner' }),
      Utils.createElement('span', { className: 'loader__text' }, 'Detecting your location...')
    ]);
    container.appendChild(loader);

    let lat, lng, locationName;
    try {
      const ipLocation = await Utils.getLocationByIP();
      lat = ipLocation.lat;
      lng = ipLocation.lng;
      locationName = ipLocation.city ? `${ipLocation.city}, ${ipLocation.country}` : ipLocation.country;
    } catch (err) {
      lat = 19.075; lng = 72.8777;
      locationName = 'Mumbai, India (default)';
    }

    try {
      lastLocation = { lat, lng };
      const timingsData = await SalahApi.getTimingsByCoords(lat, lng);
      loader.remove();
      renderAll(container, timingsData, locationName);
    } catch (err) {
      console.error('Failed to load timings:', err);
      loader.remove();
      container.appendChild(Utils.createElement('div', { className: 'empty-state' }, [
        Utils.createElement('div', { className: 'empty-state__title' }, 'Failed to Load'),
        Utils.createElement('div', { className: 'empty-state__description' }, 'Could not fetch prayer times. Please try again.')
      ]));
    }
  }

  function renderAll(container, timingsData, locationName) {
    if (timerInterval) clearInterval(timerInterval);
    container.innerHTML = '';
    const pt = timingsData.prayer_times;

    const prayers = PRAYER_ORDER.map(name => ({ name, time: pt[name] }));

    const now = new Date();
    const status = timingsData.current_status;
    const current = status?.current_prayer || getCurrentPrayer(prayers, now);
    const next = status?.next_prayer && status.next_prayer !== 'none'
      ? status.next_prayer : getNextPrayer(prayers, now);

    const h = Utils.createElement('div', { className: 'sh-header' });
    h.innerHTML = `<h1 class="sh-header__title">ٱلصَّلَاةُ</h1><p class="sh-header__date">${timingsData.date}</p>`;
    container.appendChild(h);
    container.appendChild(renderCurrentCard(prayers, current, next));
    container.appendChild(renderPrayerGrid(prayers, current));
    container.appendChild(renderCountdown(prayers, next));
    container.appendChild(renderTahajjudCard(pt));
    container.appendChild(renderExtras(pt));
    container.appendChild(renderForbidden(pt));
    container.appendChild(renderBottom(locationName, timingsData.calculation_method, timingsData.madhab));

    const gpsBtn = Utils.createElement('button', {
      className: 'btn btn--secondary',
      style: 'width: auto; display: block; margin: 0 auto; font-size: var(--font-size-sm);'
    }, 'Use GPS for precise location');
    container.appendChild(gpsBtn);
    gpsBtn.addEventListener('click', async () => {
      if (!navigator.geolocation) { Utils.showToast('Geolocation not supported', 'error'); return; }
      gpsBtn.textContent = 'Getting...';
      gpsBtn.disabled = true;
      try {
        const pos = await new Promise((res, rej) => navigator.geolocation.getCurrentPosition(res, rej, { enableHighAccuracy: true, timeout: 15000 }));
        const lat = Math.round(pos.coords.latitude * 10000) / 10000;
        const lng = Math.round(pos.coords.longitude * 10000) / 10000;
        const td = await SalahApi.getTimingsByCoords(pos.coords.latitude, pos.coords.longitude);
        renderAll(container, td, 'Your Location (GPS)');
      } catch (err) {
        Utils.showToast('Could not get GPS location', 'error');
        gpsBtn.textContent = 'Use GPS';
        gpsBtn.disabled = false;
      }
    });

    timerInterval = setInterval(() => {
      const u = new Date();
      const cur = getCurrentPrayer(prayers, u);
      const nxt = getNextPrayer(prayers, u);
      updateCountdown(container, prayers, nxt);
    }, 1000);
  }

  function renderCurrentCard(prayers, current, next) {
    const cur = prayers.find(p => p.name === current);
    const nxt = prayers.find(p => p.name === next);
    const arabic = ARABIC_NAMES[current] || current;
    const nextArabic = ARABIC_NAMES[next] || next;

    const card = Utils.createElement('div', { className: 'sh-current' });
    card.innerHTML = `
      <p class="sh-current__label">Current Prayer</p>
      <h2 class="sh-current__name">${arabic}</h2>
      <p class="sh-current__time">${cur?.time || '--:--'}</p>
      <p class="sh-current__next">Next: <strong>${nextArabic}</strong> at ${nxt?.time || '--:--'}</p>
    `;
    return card;
  }

  function renderPrayerGrid(prayers, current) {
    const grid = Utils.createElement('div', { className: 'sh-grid' });
    prayers.forEach(p => {
      const isCurrent = p.name === current;
      const arabic = ARABIC_NAMES[p.name] || '';
      const card = Utils.createElement('div', {
        className: `sh-grid__card${isCurrent ? ' sh-grid__card--current' : ''}`
      }, [
        Utils.createElement('span', { className: 'sh-grid__name' }, capitalizeFirst(p.name)),
        Utils.createElement('span', { className: 'sh-grid__time' }, p.time),
        Utils.createElement('span', { className: 'sh-grid__arabic' }, arabic)
      ]);
      grid.appendChild(card);
    });
    return grid;
  }

  function renderCountdown(prayers, next) {
    const nxt = prayers.find(p => p.name === next);
    const wrapper = Utils.createElement('div', { className: 'sh-countdown' });
    wrapper.innerHTML = `
      <p class="sh-countdown__label">Time Until ${capitalizeFirst(next)}</p>
      <p class="sh-countdown__time" id="sh-countdown-display">--:--:--</p>
      <p class="sh-countdown__next">${ARABIC_NAMES[next] || ''} at ${nxt?.time || '--:--'}</p>
    `;
    return wrapper;
  }

  function updateCountdown(container, prayers, next) {
    const el = container.querySelector('#sh-countdown-display');
    if (!el) return;
    const nxt = prayers.find(p => p.name === next);
    if (!nxt) return;
    const now = new Date();
    const [h, m] = nxt.time.split(':').map(Number);
    const total = h * 3600 + m * 60 - (now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds());
    const diff = total > 0 ? total : total + 86400;
    const hh = Math.floor(diff / 3600);
    const mm = Math.floor((diff % 3600) / 60);
    const ss = diff % 60;
    el.textContent = `${hh}:${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
  }

  function renderExtras(pt) {
    const section = Utils.createElement('div', { className: 'sh-extras' });

    const items = [
      { label: 'Sunrise', value: pt.sunrise },
      { label: 'Midnight', value: pt.midnight || '--:--' }
    ];

    items.forEach(item => {
      const el = Utils.createElement('div', { className: 'sh-extras__item' });
      el.innerHTML = `
        <span class="sh-extras__label">${item.label}</span>
        <span class="sh-extras__value">${item.value}</span>
      `;
      section.appendChild(el);
    });

    return section;
  }

  function renderForbidden(pt) {
    const section = Utils.createElement('div', { className: 'sh-forbidden' });

    const durMin = timeToMinutes(pt.dhuhr);
    const zenithStart = `${String(Math.floor((durMin - 5) / 60) % 24).padStart(2, '0')}:${String((durMin - 5) % 60).padStart(2, '0')}`;

    const rows = [
      { period: 'Fajr → Sunrise', from: pt.fajr, to: pt.sunrise },
      { period: 'Sun at Zenith', from: zenithStart, to: pt.dhuhr },
      { period: 'Asr → Maghrib', from: pt.asr, to: pt.maghrib }
    ];

    rows.forEach(r => {
      const el = Utils.createElement('div', { className: 'sh-forbidden__row' });
      el.innerHTML = `
        <span class="sh-forbidden__period">${r.period}</span>
        <span class="sh-forbidden__range">${r.from} – ${r.to}</span>
      `;
      section.appendChild(el);
    });

    return section;
  }

  function renderTahajjudCard(pt) {
    const wrapper = Utils.createElement('div', { className: 'sh-tahajjud' });

    const maghribMin = timeToMinutes(pt.maghrib);
    let fajrMin = timeToMinutes(pt.fajr);
    if (fajrMin <= maghribMin) fajrMin += 1440;
    const nightDur = fajrMin - maghribMin;
    const qiyamMin = maghribMin + Math.floor((nightDur / 3) * 2);
    const qiyamH = Math.floor(qiyamMin / 60) % 24;
    const qiyamM = qiyamMin % 60;
    const qiyamStr = `${String(qiyamH).padStart(2, '0')}:${String(qiyamM).padStart(2, '0')}`;

    const card = Utils.createElement('div', { className: 'sh-tahajjud__card' });
    card.innerHTML = `
      <div class="sh-tahajjud__info">
        <span class="sh-tahajjud__label">Tahajjud</span>
        <span class="sh-tahajjud__time">${qiyamStr}</span>
      </div>
      <span class="sh-tahajjud__chevron">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </span>
    `;
    wrapper.appendChild(card);

    const hadith = Utils.createElement('div', { className: 'sh-tahajjud__hadith' });
    hadith.style.borderLeft = '3px solid var(--color-quran)';
    hadith.innerHTML = `
      <span class="sh-tahajjud__hadith-grade" style="font-size:var(--font-size-xs);font-weight:500;color:var(--color-quran);margin-bottom:var(--spacing-xs);display:block;">Sahih</span>
      <div class="sh-tahajjud__hadith-ref" style="font-size:var(--font-size-base);color:var(--color-text);font-weight:500;margin-bottom:var(--spacing-xs);">Sahih al-Bukhari <span style="color:var(--color-text-muted);font-weight:400;">— 1145</span></div>
      <p class="sh-tahajjud__hadith-chapter" style="font-size:var(--font-size-sm);color:var(--color-text-muted);margin:0 0 var(--spacing-md);">Chp 19: Prayer at Night (Tahajjud)</p>
      <p class="sh-tahajjud__hadith-narrator" style="font-style:italic;color:var(--color-text-secondary);margin-bottom:var(--spacing-sm);font-size:var(--font-size-sm);font-weight:600;">Narrated Abu Huraira:</p>
      <div class="sh-tahajjud__hadith-text" style="font-size:var(--font-size-sm);line-height:1.7;font-weight:700;color:var(--color-text);">
        <p style="margin:0;">Allah's Messenger (ﷺ) said, "Our Lord, the Blessed, the Superior, comes every night down on the nearest Heaven to us when the last third of the night remains, saying: 'Is there anyone to invoke Me, so that I may respond to invocation? Is there anyone to ask Me, so that I may grant him his request? Is there anyone seeking My forgiveness, so that I may forgive him?'"</p>
      </div>
      <div class="sh-tahajjud__hadith-arabic rtl" style="margin-top:var(--spacing-lg);padding-top:var(--spacing-md);border-top:1px solid var(--color-border);color:var(--color-quran);font-size:var(--font-size-lg);line-height:2;font-family:var(--font-arabic);">حَدَّثَنَا عَبْدُ اللَّهِ بْنُ مَسْلَمَةَ، عَنْ مَالِكٍ، عَنِ ابْنِ شِهَابٍ، عَنْ أَبِي سَلَمَةَ، وَأَبِي عَبْدِ اللَّهِ الأَغَرِّ، عَنْ أَبِي هُرَيْرَةَ ـ رضى الله عنه ـ أَنَّ رَسُولَ اللَّهِ صلى الله عليه وسلم قَالَ ‏ "‏ يَنْزِلُ رَبُّنَا تَبَارَكَ وَتَعَالَى كُلَّ لَيْلَةٍ إِلَى السَّمَاءِ الدُّنْيَا حِينَ يَبْقَى ثُلُثُ اللَّيْلِ الآخِرُ يَقُولُ مَنْ يَدْعُونِي فَأَسْتَجِيبَ لَهُ مَنْ يَسْأَلُنِي فَأُعْطِيَهُ مَنْ يَسْتَغْفِرُنِي فَأَغْفِرَ لَهُ ‏"‏‏.‏</div>
      <a class="sh-tahajjud__hadith-link" href="#hadiths/bukhari/1145" style="font-size:var(--font-size-xs);color:var(--color-text-secondary);text-decoration:none;display:inline-flex;align-items:center;gap:4px;padding:4px 8px;transition:color 0.2s;margin-top:var(--spacing-sm);">Read full hadith →</a>
    `;
    wrapper.appendChild(hadith);

    card.addEventListener('click', () => {
      const isOpen = wrapper.classList.toggle('sh-tahajjud--open');
      card.classList.toggle('sh-tahajjud__card--expanded', isOpen);
    });

    return wrapper;
  }

  function renderBottom(locationName, method, madhab) {
    const bar = Utils.createElement('div', { className: 'sh-bottom' });

    const loc = Utils.createElement('div', { className: 'sh-bottom__loc' });
    const locSpan = Utils.createElement('span', { className: 'sh-bottom__loc-text' }, locationName);
    const refreshBtn = Utils.createElement('button', {
      className: 'sh-refresh-btn',
      title: 'Re-detect location',
      innerHTML: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>'
    });
    refreshBtn.addEventListener('click', async () => {
      refreshBtn.classList.add('spinning');
      const page = loc.closest('.salah-page') || document.getElementById('app-main');
      page.innerHTML = '';
      const loader = Utils.createElement('div', { className: 'loader' }, [
        Utils.createElement('div', { className: 'loader__spinner' }),
        Utils.createElement('span', { className: 'loader__text' }, 'Refreshing location...')
      ]);
      page.appendChild(loader);

      let newLat, newLng, newLocName;
      let retries = 0;
      while (retries < 5) {
        try {
          const locData = await Utils.getLocationByIP();
          newLat = locData.lat; newLng = locData.lng;
          newLocName = locData.city ? `${locData.city}, ${locData.country}` : locData.country;
          if (!lastLocation || Math.abs(newLat - lastLocation.lat) > 0.01 || Math.abs(newLng - lastLocation.lng) > 0.01) break;
          retries++;
          if (retries < 5) {
            loader.querySelector('.loader__text').textContent = `Retrying... (${retries}/5)`;
            await new Promise(r => setTimeout(r, 2000));
          }
        } catch { retries++; await new Promise(r => setTimeout(r, 2000)); }
      }

      if (retries >= 5 && newLat == null) {
        Utils.showToast('Could not detect location.', 'error');
        loader.remove();
        page.innerHTML = '<div class="empty-state"><div class="empty-state__title">Location Failed</div></div>';
        refreshBtn.classList.remove('spinning');
        return;
      }
      if (retries >= 5) Utils.showToast('Same location. Try GPS below.', 'error');

      try {
        lastLocation = { lat: newLat, lng: newLng };
        const td = await SalahApi.getTimingsByCoords(newLat, newLng);
        loader.remove();
        renderAll(page, td, newLocName);
      } catch {
        loader.remove();
        page.innerHTML = '<div class="empty-state"><div class="empty-state__title">Failed to Load</div></div>';
      }
    });
    loc.appendChild(locSpan);
    loc.appendChild(refreshBtn);
    bar.appendChild(loc);

    const methodNames = {
      MuslimWorldLeague: 'Muslim World League', NorthAmerica: 'ISNA', Egypt: 'Egypt',
      UmmAlQura: 'Umm Al-Qura', Karachi: 'Karachi', Kuwait: 'Kuwait', Qatar: 'Qatar',
      Gulf: 'Gulf', Singapore: 'Singapore', France: 'France', Turkey: 'Diyanet',
      Russia: 'Russia', Moonsighting: 'Moonsighting', Dubai: 'Dubai',
      Malaysia: 'Jakim', Jafari: 'Jafari'
    };
    const mName = methodNames[method] || method || 'Muslim World League';
    const meta = Utils.createElement('div', { className: 'sh-bottom__meta' });
    meta.innerHTML = `<span class="sh-bottom__method">${mName}</span><span class="sh-bottom__sep">·</span><span class="sh-bottom__madhab">${madhab || 'Shafi'}</span>`;
    bar.appendChild(meta);

    return bar;
  }

  function getCurrentPrayer(prayers, now) {
    const m = now.getHours() * 60 + now.getMinutes();
    for (let i = prayers.length - 1; i >= 0; i--) {
      const pm = timeToMinutes(prayers[i].time);
      if (pm <= m) return prayers[i].name;
    }
    return 'isha';
  }

  function getNextPrayer(prayers, now) {
    const m = now.getHours() * 60 + now.getMinutes();
    for (const p of prayers) {
      if (timeToMinutes(p.time) > m) return p.name;
    }
    return 'fajr';
  }

  function timeToMinutes(t) {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  }

  return { render };
})();

window.SalahView = SalahView;
