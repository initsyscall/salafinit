const Store = (() => {
  function get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  function set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  }

  function remove(key) {
    localStorage.removeItem(key);
  }

  function clear() {
    localStorage.clear();
  }

  function getWithTTL(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      if (!item) return defaultValue;

      const { value, expiry } = JSON.parse(item);
      if (Date.now() > expiry) {
        localStorage.removeItem(key);
        return defaultValue;
      }
      return value;
    } catch {
      return defaultValue;
    }
  }

  function setWithTTL(key, value, ttlMs) {
    try {
      const item = {
        value,
        expiry: Date.now() + ttlMs
      };
      localStorage.setItem(key, JSON.stringify(item));
      return true;
    } catch {
      return false;
    }
  }

  return { get, set, remove, clear, getWithTTL, setWithTTL };
})();
