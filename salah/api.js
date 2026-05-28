const SalahApi = (() => {
  const ALADHAN_BASE = 'https://api.aladhan.com/v1';
  const FALLBACK_BASE = 'https://api.prayertimes.date';
  const DEFAULT_METHOD = 1;

  async function getTimingsByCoords(lat, lng) {
    try {
      const data = await ApiClient.fetchApi(`${ALADHAN_BASE}/timings?latitude=${lat}&longitude=${lng}&method=${DEFAULT_METHOD}`);
      if (data.code !== 200) throw new Error('Aladhan API returned unsuccessful');
      const d = data.data;
      const t = d.timings;
      const meta = d.meta;
      return {
        date: d.date.readable,
        timezone: meta.timezone,
        calculation_method: meta.method.name,
        madhab: 'Standard',
        prayer_times: {
          imsak: t.Imsak,
          fajr: t.Fajr,
          sunrise: t.Sunrise,
          dhuhr: t.Dhuhr,
          asr: t.Asr,
          maghrib: t.Maghrib,
          isha: t.Isha,
          midnight: t.Midnight
        },
        current_status: { current_prayer: null, next_prayer: null }
      };
    } catch (err) {
      console.warn('Aladhan API failed, trying fallback:', err.message);
      return fallbackTimings(lat, lng);
    }
  }

  async function fallbackTimings(lat, lng) {
    const year = new Date().getFullYear();
    const month = new Date().getMonth() + 1;
    const day = new Date().getDate();
    const fallbackData = await ApiClient.fetchApi(
      `${FALLBACK_BASE}/timings/${year}/${month}/${day}?lat=${lat}&lon=${lng}&method=2`
    );
    const t = fallbackData.results.timings;
    return {
      date: `${day}/${month}/${year}`,
      timezone: fallbackData.results.timezone,
      calculation_method: 'ISNA',
      madhab: 'Standard',
        prayer_times: {
          imsak: t.Imsak,
          fajr: t.Fajr,
          sunrise: t.Sunrise,
          dhuhr: t.Dhuhr,
          asr: t.Asr,
          maghrib: t.Maghrib,
          isha: t.Isha,
          midnight: t.Midnight
        },
        current_status: { current_prayer: null, next_prayer: null }
      };
  }

  return { getTimingsByCoords };
})();
