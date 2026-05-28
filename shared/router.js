const Router = (() => {
  const routes = {};
  let notFoundHandler = null;

  function on(path, handler) {
    routes[path] = handler;
  }

  function notFound(handler) {
    notFoundHandler = handler;
  }

  function navigate(path) {
    window.location.hash = path;
  }

  function resolve() {
    const hash = window.location.hash.slice(1) || '/';
    const main = document.getElementById('app-main');
    if (!main) return;

    main.innerHTML = '';

    let matched = false;

    for (const [pattern, handler] of Object.entries(routes)) {
      const match = matchRoute(pattern, hash);
      if (match) {
        matched = true;
        handler(main, match.params);
        updateActiveNav(hash);
        return;
      }
    }

    if (!matched && notFoundHandler) {
      notFoundHandler(main);
    }
  }

  function matchRoute(pattern, path) {
    if (pattern === path) {
      return { params: {} };
    }

    const patternParts = pattern.split('/');
    const pathParts = path.split('/');

    if (patternParts.length !== pathParts.length) {
      return null;
    }

    const params = {};

    for (let i = 0; i < patternParts.length; i++) {
      if (patternParts[i].startsWith(':')) {
        params[patternParts[i].slice(1)] = pathParts[i];
      } else if (patternParts[i] !== pathParts[i]) {
        return null;
      }
    }

    return { params };
  }

  function updateActiveNav(hash) {
    document.querySelectorAll('.header__nav-link').forEach((link) => {
      const href = link.getAttribute('href');
      if (href) {
        const linkPath = href.replace(window.location.pathname, '').replace('#', '');
        link.classList.toggle(
          'header__nav-link--active',
          hash === linkPath || (hash.startsWith(linkPath) && linkPath !== '/')
        );
      }
    });
  }

  function init() {
    window.addEventListener('hashchange', resolve);
    window.addEventListener('DOMContentLoaded', resolve);
  }

  return { on, notFound, navigate, init };
})();
