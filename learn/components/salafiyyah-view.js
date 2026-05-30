const SalafiyyahView = (() => {
  async function render(container) {
    container.innerHTML = '';
    const page = Utils.createElement('div', { className: 'salf-page' });
    container.appendChild(page);

    const header = Utils.createElement('div', { className: 'salf-header' });
    header.innerHTML = `
      <h1 class="salf-header__title">ٱلسَّلَفِيَّةُ</h1>
      <p class="salf-header__sub">Salafiyyah is adherence to the Qur'an and authentic Sunnah upon the understanding of the righteous Salaf of this Ummah.</p>
    `;
    page.appendChild(header);

    const section1 = Utils.createElement('div', { className: 'salf-section' });
    section1.innerHTML = '<h3 class="salf-section__title">Salafiyyah Primary Resources</h3>';
    const cards1 = Utils.createElement('div', { className: 'salf-cards' });
    cards1.appendChild(createCard(
      'القرآن الكريم',
      'The Quran',
      'The final revelation from Allah to mankind',
      '#quran',
      'quran'
    ));
    cards1.appendChild(createCard(
      'السنة النبوية',
      'Sahih Hadiths',
      'The sayings, actions, and approvals of Prophet Muhammad ﷺ present in Sahih Hadiths',
      '#hadiths',
      'hadith'
    ));
    section1.appendChild(cards1);
    page.appendChild(section1);

    const section2 = Utils.createElement('div', { className: 'salf-section' });
    section2.innerHTML = '<h3 class="salf-section__title">Authentic Resources</h3>';
    const cards2 = Utils.createElement('div', { className: 'salf-cards' });
    cards2.appendChild(createCard(
      'أسماء الله الحسنى',
      'Asma ul Husna',
      'The 99 Beautiful Names of Allah',
      '#learn/salafiyyah/asmaulhusna',
      'asma'
    ));
    cards2.appendChild(createCard(
      'الأَدْعِيَةُ',
      'Duas',
      'Authentic supplications from the Qur\'an and Sunnah',
      '#learn/salafiyyah/duas',
      'duas'
    ));
    section2.appendChild(cards2);
    page.appendChild(section2);
  }

  function createCard(arabic, title, desc, href, color) {
    return Utils.createElement('a', { className: `salf-card salf-card--${color}`, href }, [
      Utils.createElement('div', { className: 'salf-card__arabic' }, arabic),
      Utils.createElement('div', { className: 'salf-card__title' }, title),
      Utils.createElement('div', { className: 'salf-card__desc' }, desc)
    ]);
  }

  async function renderAsma(container, params) {
    container.innerHTML = '';

    const page = Utils.createElement('div', { className: 'asma-page' });
    container.appendChild(page);

    const top = Utils.createElement('div', { className: 'asma-top' });
    top.innerHTML = `
      <a class="asma-top__back" href="#learn/salafiyyah">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        Salafiyyah
      </a>
    `;
    page.appendChild(top);

    const wrapper = Utils.createElement('div', { className: 'asma-wrapper' });
    page.appendChild(wrapper);

    const loader = Utils.createElement('div', { className: 'loader' }, [
      Utils.createElement('div', { className: 'loader__spinner' }),
      Utils.createElement('span', { className: 'loader__text' }, 'Loading…')
    ]);
    wrapper.appendChild(loader);

    try {
      const data = await ApiClient.fetchApi('https://ummahapi.com/api/asma-ul-husna');
      const names = data.data.names;
      if (!names || names.length !== 99) throw new Error('Invalid data');

      const searchInput = Utils.createElement('input', {
        type: 'text',
        className: 'salf-fzf-input',
        placeholder: 'Search a name…',
        autocomplete: 'off'
      });
      page.insertBefore(searchInput, wrapper);

      const scrollContainer = Utils.createElement('div', { className: 'asma-scroll' });

      names.forEach((n, i) => {
        const id = n.transliteration.toLowerCase().replace(/[^a-z0-9-]/g, '-');
        const card = Utils.createElement('div', { className: 'asma-card', id });
        const content = Utils.createElement('div', { className: 'asma-card__content' });
        content.innerHTML = `
          <span class="asma-card__number">${String(n.number).padStart(2, '0')}</span>
          <h2 class="asma-card__arabic">${n.arabic}</h2>
          <p class="asma-card__trans">${n.transliteration}</p>
          <p class="asma-card__meaning">${n.meaning}</p>
        `;

        const actions = Utils.createElement('div', { className: 'asma-actions asma-card-exclude' });
        const actionDefs = [
          { action: 'copy', title: 'Copy', svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>' },
          { action: 'image', title: 'Share Image', svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>' },
          { action: 'link', title: 'Copy Link', svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>' }
        ];
        actionDefs.forEach(def => {
          const btn = Utils.createElement('button', {
            className: 'asma-action-btn',
            title: def.title,
            'data-action': def.action,
            'data-name': n.transliteration,
            'data-arabic': n.arabic,
            'data-meaning': n.meaning
          });
          btn.innerHTML = def.svg;
          actions.appendChild(btn);
        });
        card.appendChild(Utils.createElement('div', { className: 'asma-card__bg' }));
        card.appendChild(content);
        card.appendChild(actions);
        scrollContainer.appendChild(card);
      });

      searchInput.addEventListener('input', () => {
        const q = searchInput.value.toLowerCase().trim();
        let visibleCount = 0;
        scrollContainer.querySelectorAll('.asma-card').forEach(card => {
          const arabic = card.querySelector('.asma-card__arabic')?.textContent || '';
          const trans = card.querySelector('.asma-card__trans')?.textContent || '';
          const meaning = card.querySelector('.asma-card__meaning')?.textContent || '';
          const number = card.querySelector('.asma-card__number')?.textContent || '';
          const match = !q ||
            arabic.includes(q) ||
            trans.toLowerCase().includes(q) ||
            meaning.toLowerCase().includes(q) ||
            number.includes(q);
          card.style.display = match ? '' : 'none';
          if (match) visibleCount++;
        });
        const existing = scrollContainer.querySelector('.asma-no-results');
        if (q && visibleCount === 0) {
          if (!existing) {
            const msg = Utils.createElement('div', { className: 'asma-no-results' }, 'No names match your search');
            scrollContainer.appendChild(msg);
          }
        } else if (existing) {
          existing.remove();
        }
      });

      // Action button delegation
      scrollContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('.asma-action-btn');
        if (!btn) return;
        const card = btn.closest('.asma-card');
        const name = btn.dataset.name;
        const action = btn.dataset.action;
        if (action === 'copy') copyName(btn, card);
        else if (action === 'image') shareNameImage(btn, card);
        else if (action === 'link') copyNameLink(name);
      });

      loader.remove();
      wrapper.appendChild(scrollContainer);

      setTimeout(() => {
        scrollContainer.dispatchEvent(new Event('scroll'));
        if (params && params.name) scrollToName(scrollContainer, params.name);
      }, 100);
    } catch (err) {
      console.error('Failed to load Asma ul Husna:', err);
      loader.remove();
      wrapper.appendChild(Utils.createElement('div', { className: 'empty-state' }, [
        Utils.createElement('div', { className: 'empty-state__title' }, 'Unable to Load'),
        Utils.createElement('div', { className: 'empty-state__description' }, 'Could not fetch the 99 Names. Please try again.')
      ]));
    }
  }

  // ── Dua data ──
  const DUAS = [
    { id: 'before-sleep', cat: 'Sleep', arabic: 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا', trans: 'Bismika Allāhumma amūtu wa aḥyā', meaning: 'In Your name, O Allah, I die and I live.', source: 'Sahih al-Bukhari 6312' },
    { id: 'upon-waking', cat: 'Sleep', arabic: 'الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ', trans: 'Al-ḥamdu lillāhi lladhī aḥyānā ba‘da mā amātanā wa-ilayhi n-nushūr', meaning: 'All praise is for Allah who gave us life after causing us to die, and to Him is the resurrection.', source: 'Sahih al-Bukhari 6312' },
    { id: 'before-eating', cat: 'Food', arabic: 'بِسْمِ اللَّهِ', trans: 'Bismillāh', meaning: 'In the name of Allah.', source: 'Sahih al-Bukhari 5376' },
    { id: 'after-eating', cat: 'Food', arabic: 'الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنَا وَسَقَانَا وَجَعَلَنَا مُسْلِمِينَ', trans: 'Al-ḥamdu lillāhi lladhī aṭ‘amanā wa saqānā wa ja‘alanā muslimīn', meaning: 'All praise is for Allah who fed us, gave us drink, and made us Muslims.', source: 'Sunan Abi Dawud 3850' },
    { id: 'iftaar', cat: 'Food', arabic: 'ذَهَبَ الظَّمَأُ وَابْتَلَّتِ الْعُرُوقُ وَثَبَتَ الْأَجْرُ إِنْ شَاءَ اللَّهُ', trans: 'Dhahabaẓ-ẓama’u wabtallati l-‘urūqu wa thabata l-ajru in shā’ Allāh', meaning: 'The thirst is gone, the veins are moistened, and the reward is confirmed, if Allah wills.', source: 'Sunan Abi Dawud 2357' },
    { id: 'leaving-home', cat: 'Home', arabic: 'بِسْمِ اللَّهِ، تَوَكَّلْتُ عَلَى اللَّهِ، وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ', trans: 'Bismillāh, tawakkaltu ‘alallāh, wa lā ḥawla wa lā quwwata illā billāh', meaning: 'In the name of Allah, I rely upon Allah, and there is no power nor strength except with Allah.', source: 'Sunan Abi Dawud 5095' },
    { id: 'entering-home', cat: 'Home', arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ خَيْرَ الْمَوْلَجِ وَخَيْرَ الْمَخْرَجِ، بِسْمِ اللَّهِ وَلَجْنَا، وَبِسْمِ اللَّهِ خَرَجْنَا، وَعَلَى اللَّهِ رَبِّنَا تَوَكَّلْنَا', trans: 'Allāhumma innī as’aluka khayra l-mawlaji wa khayra l-makhraj, bismillāhi walajnā, wa bismillāhi kharajnā, wa ‘alallāhi rabbinā tawakkalnā', meaning: 'O Allah, I ask You for the best of entering and the best of leaving; in the name of Allah we enter, in the name of Allah we leave, and upon our Lord we rely.', source: 'Sunan Abi Dawud 5096' },
    { id: 'entering-mosque', cat: 'Mosque', arabic: 'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ', trans: 'Allāhumma iftaḥ lī abwāba raḥmatik', meaning: 'O Allah, open for me the doors of Your mercy.', source: 'Sahih Muslim 713' },
    { id: 'leaving-mosque', cat: 'Mosque', arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ', trans: 'Allāhumma innī as’aluka min faḍlik', meaning: 'O Allah, I ask You of Your bounty.', source: 'Sahih Muslim 713' },
    { id: 'after-wudu', cat: 'Worship', arabic: 'أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ', trans: 'Ashhadu an lā ilāha illallāh waḥdahu lā sharīka lah, wa ashhadu anna Muḥammadan ‘abduhu wa rasūluh', meaning: 'I bear witness that there is no god worthy of worship except Allah alone, with no partner, and I bear witness that Muhammad is His servant and Messenger.', source: 'Sahih Muslim 234' },
    { id: 'before-prayer', cat: 'Worship', arabic: 'سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ، وَتَبَارَكَ اسْمُكَ، وَتَعَالَى جَدُّكَ، وَلَا إِلَهَ غَيْرُكَ', trans: 'Subḥānaka Allāhumma wa biḥamdik, wa tabāraka smuk, wa ta‘ālā jadduk, wa lā ilāha ghayruk', meaning: 'Glory and praise be to You, O Allah; blessed is Your name and exalted is Your majesty; there is no god worthy of worship except You.', source: 'Sunan Abi Dawud 775' },
    { id: 'travel', cat: 'Travel', arabic: 'اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ، سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ، وَإِنَّا إِلَى رَبِّنَا لَمُنْقَلِبُونَ', trans: 'Allāhu akbar, Allāhu akbar, Allāhu akbar, subḥāna lladhī sakhkhara lanā hādhā wa mā kunnā lah muqrinīn, wa innā ilā rabbinā lamunqalibūn', meaning: 'Allah is the Greatest; glory to Him who has subjected this to us, for we could never have done it by ourselves; and to our Lord we will surely return.', source: 'Sahih Muslim 1342' },
    { id: 'sneezing', cat: 'Daily', arabic: 'الْحَمْدُ لِلَّهِ', trans: 'Al-ḥamdu lillāh', meaning: 'All praise is for Allah.', source: 'Sahih al-Bukhari 6224' },
    { id: 'reply-sneeze', cat: 'Daily', arabic: 'يَرْحَمُكَ اللَّهُ', trans: 'Yarḥamukallāh', meaning: 'May Allah have mercy upon you.', source: 'Sahih al-Bukhari 6224' },
    { id: 'when-raining', cat: 'Daily', arabic: 'اللَّهُمَّ صَيِّبًا نَافِعًا', trans: 'Allāhumma ṣayyiban nāfi‘ā', meaning: 'O Allah, beneficial rain.', source: 'Sahih al-Bukhari 1032' },
    { id: 'distress', cat: 'Protection', arabic: 'لَا إِلَهَ إِلَّا اللَّهُ الْعَظِيمُ الْحَلِيمُ، لَا إِلَهَ إِلَّا اللَّهُ رَبُّ الْعَرْشِ الْعَظِيمِ، لَا إِلَهَ إِلَّا اللَّهُ رَبُّ السَّمَاوَاتِ وَرَبُّ الْأَرْضِ وَرَبُّ الْعَرْشِ الْكَرِيمِ', trans: 'Lā ilāha illallāhu l-‘aẓīmu l-ḥalīm, lā ilāha illallāhu rabbu l-‘arshi l-‘aẓīm, lā ilāha illallāhu rabbu s-samāwāti wa rabbu l-arḍi wa rabbu l-‘arshi l-karīm', meaning: 'There is no god worthy of worship except Allah, the Mighty, the Forbearing; Lord of the Mighty Throne; Lord of the heavens and the earth and the Noble Throne.', source: 'Sahih al-Bukhari 6346' },
    { id: 'morning', cat: 'Protection', arabic: 'اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ النُّشُورُ', trans: 'Allāhumma bika aṣbaḥnā, wa bika amsaynā, wa bika naḥyā, wa bika namūt, wa ilayka n-nushūr', meaning: 'O Allah, by You we enter the morning, by You we enter the evening, by You we live, by You we die, and to You is the resurrection.', source: 'Sunan Abi Dawud 5068' },
    { id: 'evening', cat: 'Protection', arabic: 'اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ الْمَصِيرُ', trans: 'Allāhumma bika amsaynā, wa bika aṣbaḥnā, wa bika naḥyā, wa bika namūt, wa ilayka l-maṣīr', meaning: 'O Allah, by You we enter the evening, by You we enter the morning, by You we live, by You we die, and to You is the final return.', source: 'Sunan Abi Dawud 5068' },
    { id: 'when-angry', cat: 'Protection', arabic: 'أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ', trans: 'A‘ūdhu billāhi mina sh-shayṭāni r-rajīm', meaning: 'I seek refuge with Allah from the accursed Shaytan.', source: 'Sahih al-Bukhari 6115' },
    { id: 'visiting-sick', cat: 'Social', arabic: 'لَا بَأْسَ، طَهُورٌ إِنْ شَاءَ اللَّهُ', trans: 'Lā ba’s, ṭahūrun in shā’ Allāh', meaning: 'No worry, it will be purification if Allah wills.', source: 'Sahih al-Bukhari 3616' },
    { id: 'new-clothes', cat: 'Daily', arabic: 'اللَّهُمَّ لَكَ الْحَمْدُ، أَنْتَ كَسَوْتَنِيهِ، أَسْأَلُكَ خَيْرَهُ وَخَيْرَ مَا صُنِعَ لَهُ، وَأَعُوذُ بِكَ مِنْ شَرِّهِ وَشَرِّ مَا صُنِعَ لَهُ', trans: 'Allāhumma laka l-ḥamd, anta kasawtanīh, as’aluka khayrahū wa khayra mā ṣuni‘a lah, wa a‘ūdhu bika min sharrihī wa sharri mā ṣuni‘a lah', meaning: 'O Allah, praise is Yours; You have clothed me with it; I ask You for its goodness and the purpose for which it was made, and I seek Your refuge from its evil and the evil of the purpose for which it was made.', source: 'Sunan Abi Dawud 4020' },
    { id: 'calamity', cat: 'Protection', arabic: 'إِنَّا لِلَّهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ، اللَّهُمَّ أْجُرْنِي فِي مُصِيبَتِي، وَأَخْلِفْ لِي خَيْرًا مِنْهَا', trans: 'Innā lillāhi wa innā ilayhi rāji‘ūn, Allāhumma’jurnī fī muṣībatī wa akhlif lī khayran minhā', meaning: 'To Allah we belong and to Him we return; O Allah, reward me in my affliction and replace it with something better.', source: 'Sahih Muslim 918' },
    { id: 'looking-mirror', cat: 'Daily', arabic: 'اللَّهُمَّ أَنْتَ حَسَّنْتَ خَلْقِي فَحَسِّنْ خُلُقِي', trans: 'Allāhumma anta ḥassanta khalqī faḥassin khuluqī', meaning: 'O Allah, just as You have made my form beautiful, make my character beautiful.', source: 'Musnad Ahmad 2567' },
    { id: 'gratitude', cat: 'Worship', arabic: 'رَبِّ أَوْزِعْنِي أَنْ أَشْكُرَ نِعْمَتَكَ الَّتِي أَنْعَمْتَ عَلَيَّ وَعَلَى وَالِدَيَّ وَأَنْ أَعْمَلَ صَالِحًا تَرْضَاهُ', trans: 'Rabbi awzi‘nī an ashkura ni‘mataka llatī an‘amta ‘alayya wa ‘alā wālidayya wa an a‘mala ṣāliḥan tarḍāh', meaning: 'My Lord, enable me to be grateful for Your favor which You have bestowed upon me and upon my parents, and to do righteous deeds that please You.', source: 'Qur\'an 46:15' },
    { id: 'guidance', cat: 'Worship', arabic: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ', trans: 'Rabbanā ātinā fī d-dunyā ḥasanatan wa fī l-ākhirati ḥasanatan wa qinā ‘adhāba n-nār', meaning: 'Our Lord, give us good in this world and good in the Hereafter, and protect us from the torment of the Fire.', source: 'Qur\'an 2:201' },
    { id: 'knowledge', cat: 'Worship', arabic: 'رَبِّ زِدْنِي عِلْمًا', trans: 'Rabbi zidnī ‘ilmā', meaning: 'My Lord, increase me in knowledge.', source: 'Qur\'an 20:114' }
  ];

  function getSourceUrl(source) {
    const m1 = source.match(/^Sahih al-Bukhari (\d+)/);
    if (m1) return `#hadiths/bukhari/${m1[1]}`;
    const m2 = source.match(/^Sahih Muslim (\d+)/);
    if (m2) return `#hadiths/muslim/${m2[1]}`;
    const m3 = source.match(/^Sunan Abi Dawud (\d+)/);
    if (m3) return `#hadiths/abudawud/${m3[1]}`;
    const m4 = source.match(/^Musnad Ahmad (\d+)/);
    if (m4) return `#hadiths/ahmed/${m4[1]}`;
    const m5 = source.match(/^Qur'an (\d+):(\d+)/);
    if (m5) return `#quran/${m5[1]}/${m5[2]}`;
    return '#';
  }

  function renderDuas(container, params) {
    container.innerHTML = '';

    const page = Utils.createElement('div', { className: 'dua-page' });
    container.appendChild(page);

    const catNames = [...new Set(DUAS.map(d => d.cat))];
    const isCatParam = params && params.id && catNames.some(c => c.toLowerCase() === params.id.toLowerCase());
    const isDuaParam = params && params.id && !isCatParam;
    const scrollToDua = isDuaParam ? DUAS.find(d => d.id === params.id) : null;
    const activeCat = isCatParam ? catNames.find(c => c.toLowerCase() === params.id.toLowerCase()) : (scrollToDua ? scrollToDua.cat : null);

    const top = Utils.createElement('div', { className: 'asma-top' });
    const showHeading = !activeCat && !isDuaParam;
    const backSvg = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>';
    top.innerHTML = showHeading ? `
      <a class="asma-top__back" href="#learn/salafiyyah">
        ${backSvg}
        Salafiyyah
      </a>
      <h2 class="dua-page__heading">Choose a category</h2>
    ` : `
      <a class="asma-top__back" href="#learn/salafiyyah">
        ${backSvg}
        Salafiyyah
      </a>
    `;
    page.appendChild(top);

    const catGrid = Utils.createElement('div', { className: 'dua-cat-grid' });
    catNames.forEach(cat => {
      const count = DUAS.filter(d => d.cat === cat).length;
      const href = `#learn/salafiyyah/duas/${cat}`;
      const card = Utils.createElement('a', {
        className: `dua-cat-card${activeCat === cat ? ' active' : ''}`,
        href
      }, [
        Utils.createElement('span', { className: 'dua-cat-card__title' }, cat),
        Utils.createElement('span', { className: 'dua-cat-card__count' }, `${count} duas`)
      ]);
      catGrid.appendChild(card);
    });
    page.appendChild(catGrid);

    if (!activeCat && !isDuaParam) return;

    const list = Utils.createElement('div', { className: 'dua-list' });
    page.appendChild(list);

    function duaPurpose(id) {
      return id.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }

    function createDuaCard(d) {
      const card = Utils.createElement('div', { className: 'dua-card', id: d.id });
      const srcUrl = getSourceUrl(d.source);
      card.innerHTML = `
        <span class="dua-card__purpose">${duaPurpose(d.id)}</span>
        <h2 class="dua-card__arabic">${d.arabic}</h2>
        <p class="dua-card__trans">${d.trans}</p>
        <p class="dua-card__meaning">${d.meaning}</p>
        <a class="dua-card__source" href="${srcUrl}" target="_blank" rel="noopener">${d.source}</a>
      `;
      const actions = Utils.createElement('div', { className: 'dua-actions' });
      const linkBtn = Utils.createElement('button', {
        className: 'dua-link-btn',
        title: 'Copy Link',
        'data-action': 'copy-dua-link',
        'data-id': d.id
      });
      linkBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>';
      actions.appendChild(linkBtn);
      card.appendChild(actions);
      return card;
    }

    const filtered = activeCat ? DUAS.filter(d => d.cat === activeCat) : DUAS;
    filtered.forEach(d => list.appendChild(createDuaCard(d)));

    list.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action="copy-dua-link"]');
      if (!btn) return;
      Share.copyLink(`#learn/salafiyyah/duas/${btn.dataset.id}`, { btn });
    });

    if (isDuaParam) {
      setTimeout(() => {
        const target = list.querySelector(`#${CSS.escape(params.id)}`);
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }

  function scrollToName(container, name) {
    const q = name.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    const target = container.querySelector(`#${CSS.escape(q)}`);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      target.style.setProperty('--asma-highlight', '1');
    }
  }

  function copyName(btn, card) {
    const arabic = card.querySelector('.asma-card__arabic')?.textContent || '';
    const trans = card.querySelector('.asma-card__trans')?.textContent || '';
    const num = card.querySelector('.asma-card__number')?.textContent || '';
    const text = `${num}. ${arabic} — ${trans}\n\n“${card.querySelector('.asma-card__meaning')?.textContent || ''}”`;
    Share.copyText(text, { btn, toast: '' });
  }

  async function shareNameImage(btn, card) {
    const origBg = card.style.background;
    const bg = getComputedStyle(document.body).getPropertyValue('--color-bg').trim();
    await Share.captureImage(card, `asma-ul-husna-${card.id || 'name'}.png`, {
      captureClass: 'asma-capturing',
      onBefore: (el) => { el.style.background = bg || '#000'; },
      onAfter: (el) => { el.style.background = origBg; }
    });
  }

  function copyNameLink(name) {
    const hash = `#learn/salafiyyah/asmaulhusna/${name.toLowerCase().replace(/[^a-z0-9-]/g, '-')}`;
    Share.copyLink(hash);
  }

  return { render, renderAsma, renderDuas };
})();

window.SalafiyyahView = SalafiyyahView;
