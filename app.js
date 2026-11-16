(() => {
  'use strict';
  const points = window.MAP_POINTS || [];
  const themes = {
    history: {
      label: '革命记忆', title: '红色根脉 · 人民群众的历史实践',
      summary: ['从笕桥老街、中央航校旧址，到衙前农民运动纪念馆、临安新四军历史纪念馆，地图中的红色记忆并不只属于一座建筑或一个瞬间。它们把地方社会、群众行动与具体的历史条件联系起来。', '以人民群众是历史的创造者为线索，既看人物与事件，也看劳动、组织与社会生活。把抗战记忆、农民运动与国家制度建设放回各自的历史背景，理解个人行动怎样汇入共同的历史实践。']
    },
    labor: {
      label: '劳动与生活', title: '生产生活 · 在劳动中读懂城市',
      summary: ['从良渚、跨湖桥的生产工具，到运河沿岸的运输、商业与城镇生活，劳动是理解杭州历史的一条线索。博物馆中的器物、桥梁与街市，让生产方式和社会生活的联系变得具体。', '一件工具怎样改变劳动？一条运河怎样连接分工与交换？茶叶又经历了怎样的种植、加工与流通？沿着这些联系观察，地方文化便有了物质生活的基础，城市发展也有了可分析的过程。']
    },
    innovation: {
      label: '创新与发展', title: '时代发展 · 科技与协作的力量',
      summary: ['杭州医药港、梦想小镇、大创小镇与杭州奥体中心体育场，提供了观察当代生产与社会协作的不同入口。研发、成果转化、创新服务与大型工程，都离不开技术、劳动和组织条件。', '从实际需要提出问题，经由研究与试验形成认识，再回到生产应用与实践反馈。将技术进步同人才、制度和公共需要联系起来，才能理解创新怎样转化为现实的生产能力。']
    },
    ecology: {
      label: '山水与乡村', title: '山水共生 · 发展中的人民生活',
      summary: ['新安江水电站、千岛湖与淳安县博物馆，构成观察工程建设和区域变化的一组线索；下姜村、径山村、东梓关村，则让视线回到产业、公共空间与村民生活。天目山与湘湖补充了自然保护和公共需要的观察。', '发展既有能源供给、产业成长和生活改善，也涉及社会成本、生态保护与利益协调。把技术、劳动、自然条件和群众参与放在一起，运用联系与矛盾的观点理解变化，避免只从景观外貌判断发展成果。']
    }
  };
  const subtitles = {
    '01':'街巷记忆中的群众实践','02':'水运、分工与城市生活','03':'社会实践与制度建设','04':'革命活动与地方群众','05':'从农民生活理解社会运动','06':'工具、劳动与社会分工',
    '07':'水乡生活与文化变迁','08':'从现实需要到研发应用','09':'长期抗战与胜利的历史条件','10':'革命实践与群众支援','11':'从器物读地方生活','12':'公共文化与人民需要',
    '13':'创新需要怎样的组织条件','14':'劳动与自然环境的联系','15':'一片茶叶中的劳动与交换','16':'航空技术与抗战需要','17':'交通条件与社会联系','18':'工程技术与协作劳动',
    '19':'运河商贸与城镇变迁','20':'技术创新与产业组织','21':'劳动、交换与地方发展','22':'工程建设与库区生活','23':'产业、劳动与乡村发展','24':'水能、技术与社会协作',
    '25':'茶产业中的分工与参与','26':'公共空间与村民生活','27':'保护、科研与自然规律','28':'遗产保护与公共需要','29':'工程、生态与区域联系','30':'群众、组织与历史条件'
  };
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const themeContainer = document.querySelector('#theme-sections');
  if (themeContainer) themeContainer.innerHTML = Object.entries(themes).map(([key, theme]) => `
    <section class="theme-section" id="theme-${key}" aria-labelledby="heading-${key}">
      <div class="theme-heading"><span class="theme-index">${String(Object.keys(themes).indexOf(key) + 1).padStart(2, '0')}</span><div><p class="section-eyebrow">${theme.label}</p><h2 id="heading-${key}">${theme.title}</h2></div></div>
      <div class="theme-text">${theme.summary.map(p => `<p>${p}</p>`).join('')}</div>
      <div class="point-links">${points.filter(p => p.category === key).map(p => `
        <button class="point-tile" data-point="${p.id}" aria-label="查看${escape(p.name)}介绍">
          <span class="tile-title"><span class="tile-number">${p.id}</span><span>${escape(p.shortName || p.name)}</span></span>
          <span class="tile-subtitle">${escape(subtitles[p.id] || p.district)}</span>
        </button>`).join('')}</div>
    </section>`).join('');

  let restartTimer = () => {};
  const carousel = document.querySelector('#carousel');
  if (carousel) {
    const slides = points.filter(p => p.image);
    const cardsContainer = document.querySelector('#carousel-cards');
    const dotsContainer = document.querySelector('#carousel-dots');
    const background = document.querySelector('#hero-background');
    let current = 0;
    let userPaused = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let hovered = false;
    let timer;
    let suppressClickUntil = 0;
    cardsContainer.innerHTML = slides.map((p, i) => `
      <article class="scene-card" data-index="${i}" aria-label="${escape(p.name)}" aria-hidden="${i !== 0}">
        <button class="scene-picture" data-point="${p.id}" aria-label="阅读${escape(p.name)}介绍">
          <img src="${p.image}" alt="${escape(p.shortName || p.name)}实景照片" ${i ? 'loading="lazy"' : 'fetchpriority="high"'} width="1200" height="850">
          <span class="scene-place"><span>${escape(p.district)}</span><span>${p.id} <span aria-hidden="true">/</span> 30</span></span>
        </button>
        <div class="scene-caption"><span class="scene-category"><span aria-hidden="true"></span>${themes[p.category].label}</span>
          <h1 class="scene-title">${escape(p.shortName || p.name)}</h1>
          <p class="scene-subtitle">${escape(subtitles[p.id])}</p>
          <p class="scene-intro">${escape(p.description[0])}</p>
          <button class="read-point" data-point="${p.id}">阅读点位 <span aria-hidden="true">↗</span></button>
        </div>
      </article>`).join('');
    dotsContainer.innerHTML = slides.map((p, i) => `<button data-slide="${i}" aria-label="转到${escape(p.shortName || p.name)}" title="${escape(p.shortName || p.name)}"></button>`).join('');
    const cards = [...cardsContainer.children];
    const dots = [...dotsContainer.children];
    const sizeWheel = () => cardsContainer.style.setProperty('--orbit-radius', `${cards[0].offsetWidth * 2.9}px`);
    sizeWheel();
    new ResizeObserver(sizeWheel).observe(cardsContainer);
    function renderCarousel() {
      cards.forEach((card, i) => {
        let distance = (i - current + slides.length) % slides.length;
        if (distance > slides.length / 2) distance -= slides.length;
        const position = Math.max(-3, Math.min(3, distance));
        const angle = position * 17;
        card.style.setProperty('--orbit-angle', `${angle}deg`);
        card.style.setProperty('--orbit-scale', String(1 - Math.abs(position) * .13));
        card.style.zIndex = String(10 - Math.abs(distance));
        card.classList.toggle('is-center', i === current);
        card.classList.toggle('is-in-orbit', Math.abs(distance) <= 2);
        card.setAttribute('aria-hidden', String(i !== current));
        card.querySelectorAll('button').forEach(button => button.tabIndex = i === current ? 0 : -1);
        const picture = card.querySelector('img');
        if (Math.abs(distance) <= 2) picture.loading = 'eager';
        dots[i].classList.toggle('active', i === current);
        dots[i].setAttribute('aria-current', i === current ? 'true' : 'false');
      });
      background.src = slides[current].image;
      document.querySelector('#carousel-count').textContent = `${String(current + 1).padStart(2, '0')} / ${slides.length}`;
    }
    function move(index) {
      const restoreFocus = cardsContainer.contains(document.activeElement);
      current = (index + slides.length) % slides.length;
      renderCarousel();
      if (restoreFocus) cards[current].querySelector('.read-point').focus({ preventScroll: true });
      restartTimer();
    }
    cardsContainer.addEventListener('click', e => {
      if (Date.now() < suppressClickUntil) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      const card = e.target.closest('.scene-card');
      if (card && Number(card.dataset.index) !== current) {
        e.stopPropagation();
        move(Number(card.dataset.index));
      }
    }, true);
    restartTimer = () => {
      clearInterval(timer);
      if (!userPaused && !hovered && !document.hidden && !document.querySelector('dialog[open]')) timer = setInterval(() => move(current + 1), 8000);
    };
    document.querySelector('#previous').addEventListener('click', () => move(current - 1));
    document.querySelector('#next').addEventListener('click', () => move(current + 1));
    dotsContainer.addEventListener('click', e => { const dot = e.target.closest('[data-slide]'); if (dot) move(Number(dot.dataset.slide)); });
    carousel.addEventListener('mouseenter', () => { hovered = true; restartTimer(); });
    carousel.addEventListener('mouseleave', () => { hovered = false; restartTimer(); });
    carousel.addEventListener('focusin', () => { hovered = true; restartTimer(); });
    carousel.addEventListener('focusout', e => { if (!carousel.contains(e.relatedTarget)) { hovered = false; restartTimer(); } });
    carousel.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight') { e.preventDefault(); move(current + 1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); move(current - 1); }
    });
    let touchX = null, touchY = null;
    carousel.addEventListener('touchstart', e => { touchX = e.changedTouches[0].clientX; touchY = e.changedTouches[0].clientY; }, {passive:true});
    carousel.addEventListener('touchend', e => {
      if (touchX === null) return;
      const dx = e.changedTouches[0].clientX - touchX, dy = e.changedTouches[0].clientY - touchY;
      if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.5) {
        suppressClickUntil = Date.now() + 450;
        move(current + (dx < 0 ? 1 : -1));
      }
      touchX = touchY = null;
    }, {passive:true});
    function renderPause() {
      const button = document.querySelector('#autoplay');
      button.textContent = userPaused ? '▷' : 'Ⅱ';
      button.setAttribute('aria-label', userPaused ? '开始自动轮播' : '暂停自动轮播');
      button.setAttribute('aria-pressed', String(userPaused));
    }
    document.querySelector('#autoplay').addEventListener('click', () => { userPaused = !userPaused; renderPause(); restartTimer(); });
    document.addEventListener('visibilitychange', restartTimer);
    renderCarousel(); renderPause(); restartTimer();
    requestAnimationFrame(() => requestAnimationFrame(() => cardsContainer.classList.add('wheel-ready')));
  }

  const pointDialog = document.querySelector('#point-dialog');
  let pointReturnHash = '';
  function showDialog(dialog) {
    if (!dialog.open) dialog.showModal();
    document.body.classList.add('modal-open');
    restartTimer();
  }
  function openPoint(id, syncHistory = true) {
    const p = points.find(p => p.id === id);
    if (!p) return;
    if (syncHistory) {
      if (!pointDialog.open && !location.hash.startsWith('#point-')) pointReturnHash = location.hash;
      const method = location.hash.startsWith('#point-') ? 'replaceState' : 'pushState';
      history[method]({ pointReturnHash }, '', `#point-${p.id}`);
    } else {
      pointReturnHash = history.state?.pointReturnHash || '';
    }
    const index = points.indexOf(p);
    const cover = p.image ? `<div class="detail-cover"><img src="${p.image}" alt="${escape(p.shortName || p.name)}实景照片"><span class="detail-number">${p.id}</span></div>` : '';
    document.querySelector('#point-content').innerHTML = `
      ${cover}<div class="detail-body"><span class="dialog-kicker">${escape(p.district)} · ${themes[p.category].label}</span>
      <h2 id="point-title">${escape(p.name)}</h2>
      <section class="detail-location" aria-labelledby="location-heading">
        <h3 class="detail-section-title" id="location-heading">地点介绍</h3>
        <p>${escape(p.description[0])}</p>
      </section>
      <section class="principles-section" aria-labelledby="principles-heading">
        <h3 class="detail-section-title" id="principles-heading"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none"><path d="M12 5.5C9 3.8 5.5 3.5 2 4.5v15c3.5-1 7-.7 10 1 3-1.7 6.5-2 10-1v-15c-3.5-1-7-.7-10 1Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M12 5.5v15" stroke="currentColor" stroke-width="1.6"/></svg><span>与马克思主义基本原理的联系</span></h3>
        <ol class="principle-list">${p.principles.map((item, i) => `<li><h4>${i + 1}. ${escape(item.title)}</h4><p>${escape(item.text)}</p></li>`).join('')}</ol>
      </section></div>
      <div class="detail-nav"><button data-point="${points[(index + points.length - 1) % points.length].id}">← 上一处</button><button data-point="${points[(index + 1) % points.length].id}">下一处 →</button></div>`;
    showDialog(pointDialog);
    pointDialog.scrollTop = 0;
  }
  document.addEventListener('click', e => {
    const link = e.target.closest('[data-point]');
    if (link) openPoint(link.dataset.point);
    const close = e.target.closest('[data-close]');
    if (close) close.closest('dialog').close();
  });
  document.querySelectorAll('dialog').forEach(dialog => {
    dialog.addEventListener('click', e => {
      if (e.target !== dialog) return;
      const r = dialog.getBoundingClientRect();
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dialog.close();
    });
    dialog.addEventListener('close', () => {
      if (!document.querySelector('dialog[open]')) document.body.classList.remove('modal-open');
      if (dialog === pointDialog && location.hash.startsWith('#point-')) history.replaceState(null, '', location.pathname + location.search + pointReturnHash);
      restartTimer();
    });
  });
  const openMap = () => showDialog(document.querySelector('#map-dialog'));
  document.querySelector('#open-map').addEventListener('click', openMap);
  document.querySelector('#open-map-footer')?.addEventListener('click', openMap);
  document.querySelector('.map-scroll').addEventListener('dblclick', e => e.currentTarget.classList.toggle('zoomed'));
  document.querySelector('#open-share').addEventListener('click', () => showDialog(document.querySelector('#share-dialog')));
  const siteUrl = document.querySelector('#site-url');
  siteUrl.textContent = window.SITE_URL || location.origin;
  siteUrl.href = window.SITE_URL || location.origin;
  window.addEventListener('popstate', () => {
    const match = location.hash.match(/^#point-(\d{2})$/);
    if (match) openPoint(match[1], false); else if (pointDialog.open) pointDialog.close();
  });
  const initial = location.hash.match(/^#point-(\d{2})$/);
  if (initial) openPoint(initial[1], false);
})();
