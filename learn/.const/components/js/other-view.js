const OtherView = (() => {
  function render(container) {
    container.innerHTML = '';

    const header = Utils.createElement('div', { className: 'other-header' }, [
      Utils.createElement('h1', { className: 'other-title' }, 'Other Religions'),
      Utils.createElement('p', { className: 'other-subtitle' }, 'Sacred texts from other traditions — for comparative study')
    ]);
    container.appendChild(header);

    const grid = Utils.createElement('div', { className: 'other-grid' }, [
      createBibleCard(),
      createHinduismCard(),
      createJudaismCard()
    ]);
    container.appendChild(grid);
  }

  function createBibleCard() {
    return Utils.createElement('a', {
      className: 'other-card other-card--bible',
      href: '#learn/other/bible'
    }, [
      Utils.createElement('div', { className: 'other-card-icon' }, [
        Utils.createElement('svg', { width: '32', height: '32', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '1.5', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
          Utils.createElement('path', { d: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20' }),
          Utils.createElement('path', { d: 'M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z' }),
          Utils.createElement('path', { d: 'M12 6v4' }),
          Utils.createElement('path', { d: 'M10 8h4' })
        ])
      ]),
      Utils.createElement('div', { className: 'other-card-name' }, 'Bible'),
      Utils.createElement('div', { className: 'other-card-arabic' }, 'الْكِتَابُ الْمُقَدَّسُ'),
      Utils.createElement('div', { className: 'other-card-desc' }, 'Old Testament & New Testament — 66 books'),
      Utils.createElement('div', { className: 'other-card-badge' }, 'Read')
    ]);
  }

  function createHinduismCard() {
    return Utils.createElement('div', {
      className: 'other-card other-card--disabled'
    }, [
      Utils.createElement('div', { className: 'other-card-icon' }, [
        Utils.createElement('svg', { width: '32', height: '32', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '1.5', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
          Utils.createElement('circle', { cx: '12', cy: '12', r: '10' }),
          Utils.createElement('path', { d: 'M12 6v12' }),
          Utils.createElement('path', { d: 'M6 12h12' })
        ])
      ]),
      Utils.createElement('div', { className: 'other-card-name' }, 'Hinduism'),
      Utils.createElement('div', { className: 'other-card-arabic' }, 'الْهُنْدُوسِيَّةُ'),
      Utils.createElement('div', { className: 'other-card-desc' }, 'Vedas, Upanishads, Bhagavad Gita'),
      Utils.createElement('div', { className: 'other-card-badge' }, 'Coming Soon')
    ]);
  }

  function createJudaismCard() {
    return Utils.createElement('div', {
      className: 'other-card other-card--disabled'
    }, [
      Utils.createElement('div', { className: 'other-card-icon' }, [
        Utils.createElement('svg', { width: '32', height: '32', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '1.5', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
          Utils.createElement('polygon', { points: '12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2' })
        ])
      ]),
      Utils.createElement('div', { className: 'other-card-name' }, 'Judaism'),
      Utils.createElement('div', { className: 'other-card-arabic' }, 'الْيَهُودِيَّةُ'),
      Utils.createElement('div', { className: 'other-card-desc' }, 'Torah, Talmud, Tanakh'),
      Utils.createElement('div', { className: 'other-card-badge' }, 'Coming Soon')
    ]);
  }

  return { render };
})();

window.OtherView = OtherView;
