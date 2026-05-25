const Utils = (() => {
  function debounce(fn, delay) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function formatDate(date, format = 'short') {
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';

    if (format === 'short') {
      return d.toLocaleDateString();
    }
    if (format === 'time') {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    if (format === 'full') {
      return d.toLocaleString();
    }
    return d.toISOString();
  }

  function createElement(tag, attrs = {}, children = []) {
    const el = document.createElement(tag);

    for (const [key, value] of Object.entries(attrs)) {
      if (key === 'className') {
        el.className = value;
      } else if (key === 'textContent') {
        el.textContent = value;
      } else if (key === 'innerHTML') {
        el.innerHTML = value;
      } else if (key.startsWith('on')) {
        el.addEventListener(key.slice(2).toLowerCase(), value);
      } else if (typeof value === 'boolean') {
        if (value) el.setAttribute(key, '');
      } else {
        el.setAttribute(key, value);
      }
    }

    if (typeof children === 'string') {
      el.textContent = children;
    } else if (Array.isArray(children)) {
      children.forEach((child) => {
        if (child instanceof Node) {
          el.appendChild(child);
        } else if (typeof child === 'string') {
          el.appendChild(document.createTextNode(child));
        }
      });
    }

    return el;
  }

  function showToast(message, type = 'success', duration = 3000) {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = createElement('div', { className: `toast toast--${type}` }, message);
    document.body.appendChild(toast);

    setTimeout(() => toast.remove(), duration);
  }

  function getGeolocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => reject(err)
      );
    });
  }

  async function getLocationByIP() {
    const data = await ApiClient.fetchApi('http://ip-api.com/json/');
    if (data.status !== 'success') throw new Error('IP location failed');
    return {
      lat: data.lat,
      lng: data.lon,
      city: data.city,
      country: data.country
    };
  }

  return {
    debounce,
    escapeHtml,
    formatDate,
    createElement,
    showToast,
    getGeolocation,
    getLocationByIP
  };
})();
