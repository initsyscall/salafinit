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
      createJudaismCard(),
      createHinduismCard()
    ]);
    container.appendChild(grid);
  }

  function createBibleCard() {
    return Utils.createElement('a', {
      className: 'other-card other-card--bible',
      href: '#learn/other/bible'
    }, [
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
      Utils.createElement('div', { className: 'other-card-name' }, 'Hinduism'),
      Utils.createElement('div', { className: 'other-card-arabic' }, 'الْهُنْدُوسِيَّةُ'),
      Utils.createElement('div', { className: 'other-card-desc' }, 'Vedas, Upanishads, Bhagavad Gita'),
      Utils.createElement('div', { className: 'other-card-badge' }, 'Coming Soon')
    ]);
  }

  function createJudaismCard() {
    return Utils.createElement('a', {
      className: 'other-card other-card--judaism',
      href: '#learn/other/judaism'
    }, [
      Utils.createElement('div', { className: 'other-card-name' }, 'Judaism'),
      Utils.createElement('div', { className: 'other-card-arabic' }, 'الْيَهُودِيَّةُ'),
      Utils.createElement('div', { className: 'other-card-desc' }, 'Tanakh — Torah, Nevi\'im, Ketuvim'),
      Utils.createElement('div', { className: 'other-card-badge' }, 'Read')
    ]);
  }

  return { render };
})();

window.OtherView = OtherView;
