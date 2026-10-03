(() => {
  const hero = document.querySelector('.hero');
  if (!hero) return;
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const sources = [
    ['Forklift Spare Parts in Warehouse.png', 'center right', '63% center'],
    ['assets/hero/toyota-warehouse.webp', 'center center', '64% center'],
    ['assets/hero/reach-truck-warehouse.webp', 'center center', '85% center'],
    ['assets/hero/electric-pallet-truck.webp', 'center center', '60% center']
  ];
  const layer = document.createElement('div');
  layer.className = 'hero-slides';
  layer.setAttribute('aria-hidden', 'true');
  hero.prepend(layer);
  let current = 0;
  let timer;
  let paused = false;
  const slides = sources.map(([source, focus, mobileFocus], index) => {
    const slide = new Image();
    slide.className = 'hero-slide' + (index === 0 ? ' is-active' : '');
    slide.alt = '';
    slide.decoding = 'async';
    slide.style.setProperty('--focus', focus);
    slide.style.setProperty('--mobile-focus', mobileFocus);
    layer.append(slide);
    return slide;
  });
  const ready = slides.map((slide, index) => new Promise(resolve => {
    slide.onload = () => resolve(true);
    slide.onerror = () => resolve(false);
    slide.src = sources[index][0];
  }));
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'hero-pause';
  button.hidden = true;
  hero.append(button);
  const labels = {
    az: ['Slideshow-u dayandır', 'Slideshow-u davam etdir', 'Foto mənbələri'],
    en: ['Pause slideshow', 'Resume slideshow', 'Photo credits'],
    ru: ['Приостановить слайд-шоу', 'Продолжить слайд-шоу', 'Источники фото']
  };
  const credits = document.createElement('a');
  credits.className = 'photo-credits';
  credits.href = './assets/hero/credits.html';
  document.querySelector('main').after(credits);
  function updateLabels() {
    const text = labels[document.documentElement.lang] || labels.az;
    button.textContent = paused ? '▶' : 'Ⅱ';
    button.setAttribute('aria-label', text[paused ? 1 : 0]);
    credits.textContent = text[2];
  }
  function schedule() {
    clearTimeout(timer);
    if (motion.matches || paused || document.hidden) return;
    timer = setTimeout(() => {
      const next = (current + 1) % slides.length;
      slides[next].classList.add('is-active');
      slides[current].classList.remove('is-active');
      current = next;
      schedule();
    }, 5000);
  }
  button.addEventListener('click', () => {
    paused = !paused;
    updateLabels();
    schedule();
  });
  document.addEventListener('visibilitychange', schedule);
  motion.addEventListener('change', () => {
    if (motion.matches) {
      slides.forEach((slide, index) => slide.classList.toggle('is-active', index === 0));
      current = 0;
    }
    schedule();
  });
  new MutationObserver(updateLabels).observe(document.documentElement, {attributes: true, attributeFilter: ['lang']});
  updateLabels();
  Promise.all(ready).then(loaded => {
    if (!loaded[0]) return;
    hero.classList.add('has-slideshow');
    for (let index = slides.length - 1; index > 0; index--) {
      if (!loaded[index]) slides.splice(index, 1)[0].remove();
    }
    if (slides.length > 1) {
      button.hidden = false;
      schedule();
    }
  });
})();
