const SalahApi = (() => {
  const ALADHAN_BASE = 'https://api.aladhan.com/v1';
  const FALLBACK_BASE = 'https://api.prayertimes.date';

  async function getTimingsByCoords(lat, lng, date = null, method = null) {
    const dateStr = date || formatDateParam(new Date());
    
    try {
      let url = `${ALADHAN_BASE}/timings/${dateStr}?latitude=${lat}&longitude=${lng}`;
      if (method !== null) {
        url += `&method=${method}`;
      }
      return await ApiClient.fetchApi(url);
    } catch (err) {
      console.warn('Aladhan API failed, trying fallback:', err.message);
      
      const year = new Date().getFullYear();
      const month = new Date().getMonth() + 1;
      const day = new Date().getDate();
      const fallbackUrl = `${FALLBACK_BASE}/timings/${year}/${month}/${day}?lat=${lat}&lon=${lng}&method=2`;
      const fallbackData = await ApiClient.fetchApi(fallbackUrl);
      
      return {
        data: {
          timings: {
            Fajr: fallbackData.results.timings.Fajr,
            Sunrise: fallbackData.results.timings.Sunrise,
            Dhuhr: fallbackData.results.timings.Dhuhr,
            Asr: fallbackData.results.timings.Asr,
            Maghrib: fallbackData.results.timings.Maghrib,
            Isha: fallbackData.results.timings.Isha
          },
          date: {
            readable: fallbackData.results.date,
            hijri: fallbackData.results.hijri,
            gregorian: fallbackData.results.gregorian
          },
          meta: { timezone: fallbackData.results.timezone }
        }
      };
    }
  }

  async function getTimingsByAddress(address, date = null, method = null) {
    const dateStr = date || formatDateParam(new Date());
    let url = `${BASE}/timingsByAddress/${dateStr}?address=${encodeURIComponent(address)}`;
    if (method !== null) {
      url += `&method=${method}`;
    }
    return ApiClient.fetchApi(url);
  }

  async function getTimingsByCity(city, country, date = null, method = null) {
    const dateStr = date || formatDateParam(new Date());
    let url = `${BASE}/timingsByCity/${dateStr}?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}`;
    if (method !== null) {
      url += `&method=${method}`;
    }
    return ApiClient.fetchApi(url);
  }

  async function getCalendarByCoords(lat, lng, year, month, method = null) {
    let url = `${BASE}/calendar/${year}/${month}?latitude=${lat}&longitude=${lng}`;
    if (method !== null) {
      url += `&method=${method}`;
    }
    return ApiClient.fetchApi(url);
  }
  async function getMethods() {
    return ApiClient.fetchApi(`${BASE}/methods`);
  }

  function formatDateParam(date) {
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  }

  return {
    getTimingsByCoords,
    getTimingsByAddress,
    getTimingsByCity,
    getCalendarByCoords,
    getMethods
  };
})();
