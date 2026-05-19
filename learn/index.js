const LearnView = (() => {
  async function render(container) {
    container.innerHTML = '';

    const header = Utils.createElement('div', { className: 'learn-header' }, [
      Utils.createElement('h1', { className: 'learn-title' }, 'Learn'),
      Utils.createElement('p', { className: 'learn-subtitle' }, 'Salafiyyah, Shia Hadiths (Academic), & Other Religions')
    ]);
    container.appendChild(header);

    const grid = Utils.createElement('div', { className: 'learn-grid' }, [
      createSalafiyyahCard(),
      createShiaHadithsCard(),
      createOtherCard()
    ]);
    container.appendChild(grid);
  }

  function createShiaHadithsCard() {
    const card = Utils.createElement('a', {
      className: 'learn-card learn-card--shia',
      href: '#learn/shia'
    }, [
      Utils.createElement('div', { className: 'learn-card-arabic' }, 'ٱلْحَدِيثُ الشِّيعِيُّ'),
      Utils.createElement('div', { className: 'learn-card-title' }, 'Shia Hadiths'),
      Utils.createElement('div', { className: 'learn-card-desc' }, 'Al-Kafi, Al-Amali, and more. Academic use only.'),
      Utils.createElement('div', { className: 'learn-card-badge' }, 'Academic')
    ]);
    return card;
  }

  function createSalafiyyahCard() {
    const card = Utils.createElement('a', {
      className: 'learn-card learn-card--salafiyyah',
      href: '#learn/salafiyyah'
    }, [
      Utils.createElement('div', { className: 'learn-card-arabic' }, 'السَّلَفِيَّةُ'),
      Utils.createElement('div', { className: 'learn-card-title' }, 'Salafiyyah'),
      Utils.createElement('div', { className: 'learn-card-desc' }, 'Salafi books and resources'),
      Utils.createElement('div', { className: 'learn-card-badge' }, 'Coming Soon')
    ]);
    return card;
  }

  function createOtherCard() {
    const card = Utils.createElement('a', {
      className: 'learn-card learn-card--other',
      href: '#learn/other'
    }, [
      Utils.createElement('div', { className: 'learn-card-arabic' }, 'أَدْيَانٌ أُخْرَى'),
      Utils.createElement('div', { className: 'learn-card-title' }, 'Other Religions'),
      Utils.createElement('div', { className: 'learn-card-desc' }, 'Bible, Hinduism, Old Testament'),
      Utils.createElement('div', { className: 'learn-card-badge' }, 'Coming Soon')
    ]);
    return card;
  }

  return { render };
})();

window.LearnView = LearnView;
