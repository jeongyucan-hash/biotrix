(()=>{
 const hero=document.querySelector('.hero');if(!hero)return;
 const slides=[...hero.querySelectorAll('.slide')],toggle=hero.querySelector('.slideToggle'),count=hero.querySelector('.slideCount'),label=hero.querySelector('#slide-label');
 if(slides.length<2||!toggle)return;
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');let current=0,paused=false,timer;
 const stop=()=>{clearInterval(timer);timer=undefined;};
 const show=index=>{current=(index+slides.length)%slides.length;slides.forEach((slide,i)=>{slide.classList.toggle('is-active',i===current);slide.setAttribute('aria-hidden',String(i!==current));});count.textContent=String(current+1).padStart(2,'0')+' / '+String(slides.length).padStart(2,'0');label.textContent=slides[current].dataset.label;};
 const start=()=>{stop();if(!paused&&!reduced.matches&&!document.hidden&&!hero.matches(':hover')&&!hero.contains(document.activeElement))timer=setInterval(()=>show(current+1),6500);};
 const renderToggle=()=>{toggle.disabled=reduced.matches;toggle.textContent=reduced.matches?'수동 전환':paused?'자동 재생':'일시정지';toggle.setAttribute('aria-pressed',String(paused||reduced.matches));toggle.setAttribute('aria-label',reduced.matches?'움직임 줄이기 설정으로 자동 전환이 꺼져 있습니다':paused?'자동 전환 시작하기':'자동 전환 멈추기');};
 hero.querySelectorAll('[data-step]').forEach(b=>b.addEventListener('click',()=>{show(current+Number(b.dataset.step));start();}));
 toggle.addEventListener('click',()=>{paused=!paused;renderToggle();start();});hero.addEventListener('mouseenter',stop);hero.addEventListener('mouseleave',start);hero.addEventListener('focusin',stop);hero.addEventListener('focusout',()=>setTimeout(start,0));document.addEventListener('visibilitychange',start);reduced.addEventListener('change',()=>{renderToggle();start();});renderToggle();start();
})();
