(() => {
  const hero = document.querySelector('.hero');
  if (!hero) return;
  const slides = [...hero.querySelectorAll('.heroimg')];
  const dots = [...hero.querySelectorAll('.hero-dots button')];
  const toggle = hero.querySelector('.hero-toggle');
  if (!slides.length || !toggle) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let active = 0;
  let timer;
  let userPaused = reduced.matches;
  const show = index => {
    active = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => slide.classList.toggle('is-active', i === active));
    dots.forEach((dot, i) => {
      dot.classList.toggle('is-active', i === active);
      if (i === active) dot.setAttribute('aria-current', 'true');
      else dot.removeAttribute('aria-current');
    });
  };
  const pause = () => { clearInterval(timer); timer = undefined; };
  const play = () => {
    pause();
    if (!userPaused && !reduced.matches && !document.hidden && !hero.matches(':hover') && !hero.contains(document.activeElement)) {
      timer = setInterval(() => show(active + 1), 6500);
    }
  };
  const label = () => {
    const paused = userPaused || reduced.matches;
    toggle.textContent = paused ? '자동 재생' : '일시정지';
    toggle.setAttribute('aria-label', paused ? '자동 전환 시작하기' : '자동 전환 멈추기');
    toggle.setAttribute('aria-pressed', String(paused));
    toggle.disabled = reduced.matches;
    if (reduced.matches) {
      toggle.textContent = '수동 전환';
      toggle.setAttribute('aria-label', '움직임 줄이기 설정으로 자동 전환이 꺼져 있습니다');
    }
  };
  toggle.addEventListener('click', () => { userPaused = !userPaused; label(); play(); });
  hero.querySelectorAll('.hero-arrow').forEach(button => button.addEventListener('click', () => {
    show(active + Number(button.dataset.direction)); play();
  }));
  dots.forEach((dot, index) => dot.addEventListener('click', () => { show(index); play(); }));
  hero.addEventListener('mouseenter', pause);
  hero.addEventListener('mouseleave', play);
  hero.addEventListener('focusin', pause);
  hero.addEventListener('focusout', () => setTimeout(play, 0));
  document.addEventListener('visibilitychange', play);
  reduced.addEventListener('change', () => { label(); play(); });
  label(); play();
})();
