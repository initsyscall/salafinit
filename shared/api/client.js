const ApiClient = (() => {
  const CACHE_TTL = 1000 * 60 * 30;

  async function fetchApi(url, options = {}, retries = 2) {
    const cacheKey = `api:${url}`;

    if (options.cache !== false) {
      const cached = Store.getWithTTL(cacheKey);
      if (cached) {
        return cached;
      }
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    try {
      const { cache, ...fetchOptions } = options;
      const response = await window.fetch(url, {
        headers: {
          'Accept': 'application/json'
        },
        ...fetchOptions,
        signal: controller.signal,
        mode: 'cors'
      });

      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (options.cache !== false) {
        Store.setWithTTL(cacheKey, data, CACHE_TTL);
      }

      return data;
    } catch (error) {
      clearTimeout(timeout);
      console.error(`API Error (${url}):`, error);

      if (retries > 0 && error.message.includes('Failed to fetch')) {
        console.log(`Retrying... ${retries} attempts left`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return fetchApi(url, options, retries - 1);
      }

      if (error.name === 'AbortError') {
        throw new Error('Request timed out. Please check your connection.');
      }
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        throw new Error('Network error. Please check your internet connection.');
      }
      throw error;
    }
  }

  function clearCache() {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('api:')) {
        keys.push(key);
      }
    }
    keys.forEach((key) => localStorage.removeItem(key));
  }

  return { fetchApi, clearCache };
})();
