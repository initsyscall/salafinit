const LearnView = (() => {
  async function render(container) {
    container.innerHTML = '';

    const header = Utils.createElement('div', { className: 'page-header' }, [
      Utils.createElement('h1', { className: 'page-header__title' }, 'Learn'),
      Utils.createElement('p', { className: 'page-header__subtitle' }, 'Salafiyyah resources, Shia Hadiths,  & Other Religion resources')
    ]);
    container.appendChild(header);

    const grid = Utils.createElement('div', { className: 'grid grid--responsive' }, [
      createSalafiyyahCard(),
      createShiaHadithsCard(),
      createOtherCard()
    ]);
    container.appendChild(grid);
  }

  function createShiaHadithsCard() {
    const card = Utils.createElement('a', {
      className: 'card feature-card feature-card--shia',
      href: '#learn/shia',
      style: 'cursor: pointer;'
    }, [
      Utils.createElement('div', { className: 'feature-card__arabic feature-card__arabic--shia' }, 'ٱلْحَدِيثُ الشِّيعِيُّ'),
      Utils.createElement('p', { className: 'feature-card__description' }, 'Shia Hadith Collections - Al-Kafi, Al-Amali, and more. Only for academic purposes - we do not accept Shia narrations.'),
      Utils.createElement('span', { className: 'badge badge--danger', style: 'margin-top: var(--spacing-sm);' }, 'Academic Use Only')
    ]);
    return card;
  }

  function createSalafiyyahCard() {
    const card = Utils.createElement('a', {
      className: 'card feature-card feature-card--salafiyyah',
      href: '#learn/salafiyyah',
      style: 'cursor: pointer; background: linear-gradient(135deg, rgba(162, 119, 255, 0.2) 0%, rgba(162, 119, 255, 0.1) 100%); border: 2px solid #F6C177;'
    }, [
      Utils.createElement('div', { className: 'feature-card__arabic feature-card__arabic--salafiyyah', style: 'color: #F6C177;' }, 'السَّلَفِيَّةُ'),
      Utils.createElement('p', { className: 'feature-card__description' }, 'Salafi books and resources - Coming Soon'),
      Utils.createElement('span', { className: 'badge badge--primary', style: 'margin-top: var(--spacing-sm);' }, 'Coming Soon')
    ]);
    return card;
  }

  function createOtherCard() {
    const card = Utils.createElement('a', {
      className: 'card feature-card feature-card--other',
      href: '#learn/other',
      style: 'cursor: pointer; background: linear-gradient(135deg, rgba(107, 114, 128, 0.15) 0%, rgba(107, 114, 128, 0.08) 100%); border: 2px solid #6B7280;'
    }, [
      Utils.createElement('div', { className: 'feature-card__arabic feature-card__arabic--other', style: 'color: #6B7280;' }, 'أَدْيَانٌ أُخْرَى'),
      Utils.createElement('p', { className: 'feature-card__description' }, 'Other religious texts - Bible, Hinduism, Old Testament - Coming Soon'),
      Utils.createElement('span', { className: 'badge badge--secondary', style: 'margin-top: var(--spacing-sm);' }, 'Coming Soon')
    ]);
    return card;
  }

  return { render };
})();

window.LearnView = LearnView;
