const SalahView = (() => {
  let timerInterval = null;
  let lastLocation = null;

  const arabicPrayerNames = {
    Fajr: 'الفجر',
    Sunrise: 'الشروق',
    Dhuhr: 'الظهر',
    Asr: 'العصر',
    Maghrib: 'المغرب',
    Isha: 'العشاء'
  };

  function getArabicPrayerName(name) {
    return arabicPrayerNames[name] || name;
  }

  async function render(container) {
    container.innerHTML = '';
    const content = Utils.createElement('div', { id: 'salah-content', className: 'salah-page salah-has-bg' });
    container.appendChild(content);
    loadTimings(content);
  }

  async function loadTimings(container) {
    const loader = Utils.createElement('div', { className: 'loader' }, [
      Utils.createElement('div', { className: 'loader__spinner' }),
      Utils.createElement('span', { className: 'loader__text' }, 'Detecting your location...')
    ]);
    container.appendChild(loader);

    let lat, lng, locationName, isPrecise = false;

    try {
      loader.querySelector('.loader__text').textContent = 'Getting location...';
      const ipLocation = await Utils.getLocationByIP();
      lat = ipLocation.lat;
      lng = ipLocation.lng;
      const city = ipLocation.city || '';
      
      if (city) {
        locationName = `${city}, ${ipLocation.country}`;
      } else {
        locationName = `${ipLocation.country}`;
      }
    } catch (err) {
      console.error('IP location failed:', err.message);
      lat = 19.075;
      lng = 72.8777;
      locationName = 'Mumbai, India (default)';
    }

    try {
      lastLocation = { lat, lng };
      const data = await SalahApi.getTimingsByCoords(lat, lng);
      loader.remove();
      renderTimings(container, data.data, locationName);
    } catch (err) {
      console.error('Failed to load timings:', err);
      loader.remove();
      container.appendChild(Utils.createElement('div', { className: 'empty-state' }, [
        Utils.createElement('div', { className: 'empty-state__title' }, 'Failed to Load'),
        Utils.createElement('div', { className: 'empty-state__description' }, 'Could not fetch prayer times. Please try again.')
      ]));
    }

    window.salahRefreshWithGPS = async function() {
      try {
        container.innerHTML = '';
        const newLoader = Utils.createElement('div', { className: 'loader' }, [
          Utils.createElement('div', { className: 'loader__spinner' }),
          Utils.createElement('span', { className: 'loader__text' }, 'Getting precise GPS location...')
        ]);
        container.appendChild(newLoader);
        
        const geo = await Utils.getGeolocation();
        const geoData = await SalahApi.getTimingsByCoords(geo.lat, geo.lng);
        newLoader.remove();
        renderTimings(container, geoData.data, 'Your Location (GPS)');
      } catch (err) {
        console.error('GPS location failed:', err.message);
        Utils.showToast('Could not get precise location. Using previous location.', 'error');
        loadTimings(container);
      }
    }
  }

  function renderTimings(container, data, locationName) {
    if (timerInterval) clearInterval(timerInterval);

    const { timings, date, meta } = data;
    container.innerHTML = '';

    const prayers = [
      { name: 'Fajr', time: timings.Fajr },
      { name: 'Sunrise', time: timings.Sunrise },
      { name: 'Dhuhr', time: timings.Dhuhr },
      { name: 'Asr', time: timings.Asr },
      { name: 'Maghrib', time: timings.Maghrib },
      { name: 'Isha', time: timings.Isha }
    ];

    const now = new Date();
    const currentPrayer = getCurrentPrayer(prayers, now);
    const nextPrayer = getNextPrayer(prayers, now);

    const header = Utils.createElement('div', { className: 'salah-header' });
    header.innerHTML = `
      <h1 class="salah-header__title">ٱلصَّلَاةُ</h1>
      <p class="salah-header__subtitle">Prayer Times</p>
    `;
    container.appendChild(header);

    container.appendChild(renderCurrentPrayer(prayers, currentPrayer, nextPrayer, now, timings));

    const gridSection = Utils.createElement('div', { className: 'salah-grid' });
    gridSection.appendChild(renderPrayerGrid(prayers));
    gridSection.appendChild(renderQiyam(timings));
    gridSection.appendChild(renderForbiddenTimes(timings));
    container.appendChild(gridSection);

    container.appendChild(renderCountdown(prayers, now, nextPrayer));
    
    const locationBar = Utils.createElement('div', { className: 'salah-location', style: 'justify-content: center; gap: var(--spacing-sm);' });
    locationBar.innerHTML = `<span>${locationName}</span>`;
    const refreshBtn = Utils.createElement('button', {
      className: 'salah-refresh-btn',
      title: 'Re-detect location',
      innerHTML: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>'
    });
    refreshBtn.addEventListener('click', async () => {
      refreshBtn.classList.add('spinning');
      container.innerHTML = '';
      const newContent = Utils.createElement('div', { className: 'salah-page salah-has-bg' });
      container.appendChild(newContent);

      const loader = Utils.createElement('div', { className: 'loader' }, [
        Utils.createElement('div', { className: 'loader__spinner' }),
        Utils.createElement('span', { className: 'loader__text' }, 'Refreshing location...')
      ]);
      newContent.appendChild(loader);

      let newLat, newLng, newLocationName;
      let retries = 0;
      const maxRetries = 5;

      while (retries < maxRetries) {
        try {
          const ipLocation = await Utils.getLocationByIP();
          newLat = ipLocation.lat;
          newLng = ipLocation.lng;
          const city = ipLocation.city || '';
          newLocationName = city ? `${city}, ${ipLocation.country}` : ipLocation.country;

          if (!lastLocation ||
              Math.abs(newLat - lastLocation.lat) > 0.01 ||
              Math.abs(newLng - lastLocation.lng) > 0.01) {
            break;
          }

          retries++;
          if (retries < maxRetries) {
            loader.querySelector('.loader__text').textContent = `Same location, retrying... (${retries}/${maxRetries})`;
            await new Promise(r => setTimeout(r, 2000));
          }
        } catch (err) {
          retries++;
          if (retries >= maxRetries) break;
          await new Promise(r => setTimeout(r, 2000));
        }
      }

      if (retries >= maxRetries && newLat == null) {
        Utils.showToast('Could not detect location. Try GPS below.', 'error');
        loader.remove();
        newContent.appendChild(Utils.createElement('div', { className: 'empty-state' }, [
          Utils.createElement('div', { className: 'empty-state__title' }, 'Location Failed'),
          Utils.createElement('div', { className: 'empty-state__description' }, 'Could not detect your location. Use the GPS button below.')
        ]));
        refreshBtn.classList.remove('spinning');
        return;
      }

      if (retries >= maxRetries) {
        Utils.showToast('Could not get a different location. Try GPS below.', 'error');
      }

      try {
        lastLocation = { lat: newLat, lng: newLng };
        const data = await SalahApi.getTimingsByCoords(newLat, newLng);
        loader.remove();
        renderTimings(newContent, data.data, newLocationName);
      } catch (err) {
        loader.remove();
        newContent.appendChild(Utils.createElement('div', { className: 'empty-state' }, [
          Utils.createElement('div', { className: 'empty-state__title' }, 'Failed to Load'),
          Utils.createElement('div', { className: 'empty-state__description' }, 'Could not fetch prayer times. Please try again.')
        ]));
      }
    });
    locationBar.appendChild(refreshBtn);
    container.appendChild(locationBar);
    
    const gpsBtn = Utils.createElement('button', {
      className: 'btn btn--secondary',
      style: 'width: auto; display: block; margin: 0 auto var(--spacing-md); font-size: var(--font-size-sm);'
    }, 'Fetch accurate location');
    container.appendChild(gpsBtn);
    
    gpsBtn.addEventListener('click', async () => {
      if (!navigator.geolocation) {
        Utils.showToast('Geolocation not supported', 'error');
        return;
      }
      gpsBtn.textContent = 'Getting...';
      gpsBtn.disabled = true;
      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 });
        });
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const data = await SalahApi.getTimingsByCoords(lat, lng);
        renderTimings(container, data.data, 'Your Location (GPS)');
      } catch (err) {
        console.error('GPS error:', err);
        Utils.showToast('Could not get GPS location', 'error');
        gpsBtn.textContent = 'Fetch accurate';
        gpsBtn.disabled = false;
      }
    });
    
    container.appendChild(renderMethod(meta));

    timerInterval = setInterval(() => {
      const updatedNow = new Date();
      const current = getCurrentPrayer(prayers, updatedNow);
      const next = getNextPrayer(prayers, updatedNow);
      updateCountdownDisplay(prayers, updatedNow, next, container);
    }, 1000);
  }

  function updateCountdownDisplay(prayers, now, nextPrayer, container) {
    const countdownEl = container.querySelector('#salah-countdown-display');
    if (!countdownEl) return;
    
    const nextPrayerData = prayers.find(p => p.name === nextPrayer);
    if (!nextPrayerData) return;
    
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const [nextH, nextM] = nextPrayerData.time.split(':').map(Number);
    const nextMinutes = nextH * 60 + nextM;
    
    let diffMinutes = nextMinutes - nowMinutes;
    if (diffMinutes < 0) diffMinutes += 24 * 60;
    
    const nowSeconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
    const nextSeconds = nextH * 3600 + nextM * 60;
    let diffTotalSeconds = nextSeconds - nowSeconds;
    if (diffTotalSeconds < 0) diffTotalSeconds += 24 * 3600;
    
    const h = Math.floor(diffTotalSeconds / 3600);
    const m = Math.floor((diffTotalSeconds % 3600) / 60);
    const s = diffTotalSeconds % 60;
    
    countdownEl.textContent = `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  function renderCountdown(prayers, now, nextPrayer) {
    const wrapper = Utils.createElement('div', { className: 'salah-countdown' });
    
    const nextPrayerData = prayers.find(p => p.name === nextPrayer);
    const nextTime = nextPrayerData?.time || '--:--';
    
    wrapper.innerHTML = `
      <p class="salah-countdown__label">Time Until Next Prayer</p>
      <p class="salah-countdown__time" id="salah-countdown-display">--:--:--</p>
      <p class="salah-countdown__next">${nextPrayer} at ${nextTime}</p>
    `;
    
    return wrapper;
  }

  function renderCurrentPrayer(prayers, current, next, now, timings) {
    const wrapper = Utils.createElement('div', { className: 'salah-current' });

    const currentPrayerData = prayers.find(p => p.name === current);
    const nextPrayerData = prayers.find(p => p.name === next);

    const arabicName = getArabicPrayerName(current);
    const nextArabicName = getArabicPrayerName(next);

    wrapper.innerHTML = `
      <p class="salah-current__label">Current Prayer</p>
      <h1 class="salah-current__name">${arabicName}</h1>
      <p class="salah-current__time">${currentPrayerData?.time || '--:--'}</p>
      <p class="salah-current__next">Next: <strong>${nextArabicName}</strong> at ${nextPrayerData?.time || '--:--'}</p>
    `;

    return wrapper;
  }

  function renderPrayerGrid(prayers) {
    const grid = Utils.createElement('div', { className: 'prayer-grid' });

    const labels = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
    labels.forEach(name => {
      const prayer = prayers.find(p => p.name === name);
      if (!prayer) return;

      const card = Utils.createElement('div', { className: `prayer-card prayer-card--${name.toLowerCase()}` }, [
        Utils.createElement('div', { className: 'prayer-card__name' }, prayer.name),
        Utils.createElement('div', { className: 'prayer-card__time' }, prayer.time)
      ]);
      grid.appendChild(card);
    });

    return grid;
  }

  function renderQiyam(timings) {
    const wrapper = Utils.createElement('div', { className: 'qiyam-section' });

    const maghribTime = timeToMinutes(timings.Maghrib);
    let fajrTime = timeToMinutes(timings.Fajr);
    if (fajrTime <= maghribTime) fajrTime += 1440;

    const nightDuration = fajrTime - maghribTime;

    const ishaEnd = maghribTime + Math.floor(nightDuration / 2);
    const ishaEndH = Math.floor(ishaEnd / 60) % 24;
    const ishaEndM = ishaEnd % 60;
    const ishaEndStr = `${String(ishaEndH).padStart(2, '0')}:${String(ishaEndM).padStart(2, '0')}`;

    const qiyamStart = maghribTime + Math.floor((nightDuration / 3) * 2);
    const qiyamStartH = Math.floor(qiyamStart / 60) % 24;
    const qiyamStartM = qiyamStart % 60;
    const qiyamTimeStr = `${String(qiyamStartH).padStart(2, '0')}:${String(qiyamStartM).padStart(2, '0')}`;

    wrapper.appendChild(Utils.createElement('h3', { className: 'section-title' }, 'Qiyam al-Layl'));
    wrapper.appendChild(Utils.createElement('p', { className: 'qiyam-time' }, `Qiyam starts: ${qiyamTimeStr}`));
    return wrapper;
  }

  function renderForbiddenTimes(timings) {
    const wrapper = Utils.createElement('div', { className: 'forbidden-section' });
    wrapper.appendChild(Utils.createElement('h3', { className: 'section-title' }, 'Forbidden Prayer Times'));

    const times = Utils.createElement('ul', { className: 'forbidden-list' }, [
      Utils.createElement('li', {}, `After Fajr until ${timings.Sunrise}`),
      Utils.createElement('li', {}, `At zenith (when sun is at highest point)`),
      Utils.createElement('li', {}, `After Asr until Maghrib`)
    ]);
    wrapper.appendChild(times);

    return wrapper;
  }

  function renderLocationDate(locationName, date) {
    const wrapper = Utils.createElement('div', { className: 'location-date' });
    wrapper.appendChild(Utils.createElement('p', { className: 'location' }, locationName || 'Your Location'));
    wrapper.appendChild(Utils.createElement('p', { className: 'date' }, `${date.readable} | ${date.hijri?.day} ${date.hijri?.month?.en} ${date.hijri?.year} AH`));
    return wrapper;
  }

  function renderMethod(meta) {
    const wrapper = Utils.createElement('div', { className: 'salah-footer' });
    const methodName = {
      'UIS': 'University of Islamic Sciences',
      'MWL': 'Muslim World League',
      'ISNA': 'Islamic Society of North America',
      'Egypt': 'Egyptian General Authority'
    }[meta?.method] || 'University of Islamic Sciences';
    
    wrapper.innerHTML = `
      <p class="salah-footer__method">Method: ${methodName}</p>
    `;
    return wrapper;
  }

  function updateCountdown(page, prayers, now, timings) {
    const countdownEl = page.querySelector('.countdown-value');
    if (!countdownEl) return;

    const nextPrayerName = page.querySelector('.countdown-label')?.textContent?.replace('Next: ', '');
    const nextPrayer = prayers.find(p => p.name === nextPrayerName);
    if (!nextPrayer) return;

    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const nextMinutes = timeToMinutes(nextPrayer.time);
    const remaining = nextMinutes - nowMinutes;

    if (remaining > 0) {
      countdownEl.textContent = nextPrayer.time;

      const makruhWarning = page.querySelector('.makruh-warning');
      if (remaining <= 15 && nextPrayerName !== 'Sunrise') {
        if (!makruhWarning) {
          const warning = Utils.createElement('div', { className: 'makruh-warning' }, [
            Utils.createElement('span', {}, 'Makruh time - pray fast'),
            Utils.createElement('span', { className: 'makruh-time' }, `${remaining} mins left`)
          ]);
          page.querySelector('.current-prayer__info')?.prepend(warning);
        } else {
          makruhWarning.querySelector('.makruh-time').textContent = `${remaining} mins left`;
        }
      }
    }
  }

  function getCurrentPrayer(prayers, now) {
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    for (let i = prayers.length - 1; i >= 0; i--) {
      if (prayers[i].name === 'Sunrise') continue;
      const prayerMinutes = timeToMinutes(prayers[i].time);
      if (prayerMinutes <= nowMinutes) {
        return prayers[i].name;
      }
    }
    return 'Isha';
  }

  function getNextPrayer(prayers, now) {
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    for (const prayer of prayers) {
      if (prayer.name === 'Sunrise') continue;
      const prayerMinutes = timeToMinutes(prayer.time);
      if (prayerMinutes > nowMinutes) {
        return prayer.name;
      }
    }
    return 'Fajr (Tomorrow)';
  }

  function timeToMinutes(time) {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  }

  function formatCountdown(minutes) {
    if (minutes <= 0) return 'Now';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  }

  function showManualInput(container) {
    const contentDiv = Utils.createElement('div', { className: 'empty-state' }, [
      Utils.createElement('div', { className: 'empty-state__title' }, 'Location Required'),
      Utils.createElement('div', { className: 'empty-state__description' }, 'Enter your city to see prayer times.'),
      Utils.createElement('div', { style: 'margin-top: var(--spacing-lg); display: flex; gap: var(--spacing-md); justify-content: center; flex-wrap: wrap;' }, [
        Utils.createElement('input', { type: 'text', id: 'salah-city', className: 'input', placeholder: 'City, Country', style: 'max-width: 200px;' }),
        Utils.createElement('button', { id: 'salah-search-btn', className: 'btn btn--primary' }, 'Search')
      ])
    ]);
    container.appendChild(contentDiv);

    document.getElementById('salah-search-btn').addEventListener('click', async () => {
      const cityInput = document.getElementById('salah-city');
      const city = cityInput.value.trim();
      if (!city) return;

      const btn = document.getElementById('salah-search-btn');
      btn.textContent = 'Searching...';
      btn.disabled = true;

      try {
        const searchFormats = [
          city,
          `${city}, India`,
          `${city}, IN`,
          `${city}, UAE`,
          `${city}, Pakistan`,
          `${city}, Bangladesh`,
          `${city}, Saudi Arabia`
        ];

        let data = null;
        for (const format of searchFormats) {
          try {
            data = await SalahApi.getTimingsByAddress(format);
            if (data.code === 200) break;
          } catch (e) {
            continue;
          }
        }

        if (!data || data.code !== 200) {
          throw new Error('City not found');
        }

        container.innerHTML = '';
        renderTimings(container, data.data, city);
      } catch (err) {
        btn.textContent = 'Search';
        btn.disabled = false;
        const errorMsg = Utils.createElement('div', { style: 'color: var(--color-danger); font-size: var(--font-size-sm); margin-top: var(--spacing-sm);' }, `Could not find "${city}". Try "Mumbai, India" or "Dubai, UAE"`);
        contentDiv.appendChild(errorMsg);
      }
    });
  }

  return { render };
})();

window.SalahView = SalahView;
