const Theme = (() => {
  const THEMES = {
    nightSyscall: {
      type: 'dark',
      colors: {
        bg: '#161423', surface: '#201D33', border: '#322D4A',
        textPrimary: '#E0DEF4', textSecondary: '#908CAA', textMuted: '#6E6A86',
        kwd: '#A277FF', fnc: '#FF3366', typ: '#CBA6F7', str: '#F087BD',
        num: '#F6C177', opr: '#80FFEA'
      }
    },
    daySyscall: {
      type: 'light',
      colors: {
        bg: '#fcf0e0', surface: '#f5e8d8', border: '#e0d0c0',
        textPrimary: '#201820', textSecondary: '#584870', textMuted: '#a888a8',
        kwd: '#8040e0', fnc: '#d03060', typ: '#9060d0', str: '#c06080',
        num: '#c08830', opr: '#30a890'
      }
    }
  };

  function hexToRgb(hex) {
    const v = parseInt(hex.slice(1), 16);
    return { r: (v >> 16) & 255, g: (v >> 8) & 255, b: v & 255 };
  }

  function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => Math.round(x).toString(16).padStart(2, '0')).join('');
  }

  function mixColor(hex, mixHex, amount) {
    const a = hexToRgb(hex), b = hexToRgb(mixHex);
    return rgbToHex(a.r + (b.r - a.r) * amount, a.g + (b.g - a.g) * amount, a.b + (b.b - a.b) * amount);
  }

  function toRgba(hex, alpha) {
    const c = hexToRgb(hex);
    return `rgba(${c.r},${c.g},${c.b},${alpha})`;
  }

  function applyTheme(name) {
    const theme = THEMES[name];
    if (!theme) return;
    const c = theme.colors;
    const isDark = theme.type === 'dark';
    const mix = isDark ? '#FFFFFF' : '#000000';
    const set = (v, val) => document.documentElement.style.setProperty(v, val);

    set('--color-bg', c.bg);
    set('--color-surface', c.surface);
    set('--color-surface-hover', mixColor(c.surface, mix, 0.08));
    set('--color-surface-active', mixColor(c.surface, mix, 0.15));
    set('--color-border', c.border);
    set('--color-border-light', mixColor(c.border, mix, 0.15));
    set('--color-text', c.textPrimary);
    set('--color-text-secondary', c.textSecondary);
    set('--color-text-muted', c.textMuted);
    set('--color-text-inverse', isDark ? c.textPrimary : c.bg);

    set('--color-primary', c.kwd);
    set('--color-primary-hover', mixColor(c.kwd, mix, 0.1));
    set('--color-primary-subtle', toRgba(c.kwd, 0.15));

    set('--color-accent', c.num);
    set('--color-accent-hover', mixColor(c.num, mix, 0.1));
    set('--color-accent-subtle', toRgba(c.num, 0.15));

    set('--color-danger', c.fnc);
    set('--color-danger-subtle', toRgba(c.fnc, 0.15));

    set('--color-warning', c.num);
    set('--color-warning-subtle', toRgba(c.num, 0.15));

    set('--color-quran', c.num);
    set('--color-quran-subtle', toRgba(c.num, 0.15));
    set('--color-hadith', c.opr);
    set('--color-hadith-subtle', toRgba(c.opr, 0.15));
    set('--color-salah', c.kwd);
    set('--color-salah-subtle', toRgba(c.kwd, 0.15));
    set('--color-learn', c.typ);
    set('--color-learn-subtle', toRgba(c.typ, 0.15));
    set('--color-note', c.str);
    set('--color-note-subtle', toRgba(c.str, 0.15));
    set('--color-bookmark', c.textMuted);
    set('--color-bookmark-subtle', toRgba(c.textMuted, 0.15));
    set('--color-shia', c.fnc);
    set('--color-shia-subtle', toRgba(c.fnc, 0.15));

    set('--grade-sahih', isDark ? '#22C55E' : '#16a34a');
    set('--grade-hasan', c.num);
    set('--grade-daif', c.fnc);

    set('--shadow-sm', isDark ? '0 1px 3px rgba(0,0,0,0.4)' : '0 1px 3px rgba(0,0,0,0.08)');
    set('--shadow-md', isDark ? '0 4px 12px rgba(0,0,0,0.5)' : '0 4px 12px rgba(0,0,0,0.12)');
    set('--shadow-lg', isDark ? '0 8px 32px rgba(0,0,0,0.6)' : '0 8px 32px rgba(0,0,0,0.16)');
    set('--shadow-glow', `0 0 24px ${toRgba(c.kwd, 0.2)}`);
    set('--shadow-gold', `0 0 20px ${toRgba(c.num, 0.15)}`);

    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', c.surface);
    localStorage.setItem('theme', name);
  }

  function getSaved() {
    return localStorage.getItem('theme') || 'nightSyscall';
  }

  function init() {
    applyTheme(getSaved());
    addToggleButtons();
    addTransitionStyle();
  }

  function toggle() {
    const current = getSaved();
    const next = current === 'nightSyscall' ? 'daySyscall' : 'nightSyscall';
    applyTheme(next);
    updateToggleIcons();
  }

  function addToggleButtons() {
    const nav = document.getElementById('header-nav');
    if (!nav) return;

    const desktopBtn = document.createElement('button');
    desktopBtn.className = 'theme-toggle theme-toggle--desktop';
    desktopBtn.title = 'Toggle theme';
    desktopBtn.addEventListener('click', toggle);
    nav?.prepend(desktopBtn);

    if (nav) {
      const mobileBtn = document.createElement('button');
      mobileBtn.className = 'theme-toggle theme-toggle--mobile';
      mobileBtn.title = 'Toggle theme';
      mobileBtn.addEventListener('click', (e) => {
        toggle();
        e.stopPropagation();
      });
      nav.prepend(mobileBtn);
    }

    updateToggleIcons();
  }

  function updateToggleIcons() {
    const isNight = getSaved() === 'nightSyscall';
    document.querySelectorAll('.theme-toggle').forEach(btn => {
      btn.innerHTML = isNight
        ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>`
        : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
    });
  }

  function addTransitionStyle() {
    const style = document.createElement('style');
    style.textContent = `
      *, *::before, *::after {
        transition: background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease, box-shadow 0.3s ease !important;
      }
    `;
    style.id = 'theme-transition-style';
    document.head.appendChild(style);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return { init, toggle, getSaved };
})();
