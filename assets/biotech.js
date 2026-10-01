document.querySelectorAll('.mobile').forEach(menu=>{menu.addEventListener('keydown',event=>{if(event.key==='Escape'){menu.open=false;menu.querySelector('summary').focus();}});menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>menu.open=false));});

document.querySelectorAll('.hero-gallery').forEach(gallery=>{
  const slides=[...gallery.querySelectorAll('.hero-slide')];
  const toolbar=gallery.querySelector('.slide-toolbar');
  const pauseButton=gallery.querySelector('[data-slide="pause"]');
  const indexLabel=gallery.querySelector('.slide-index');
  const caption=gallery.querySelector('.image-note');
  const meanings=['더 많은 사람의 일상으로','세대를 이어가는 삶의 가능성','가능성을 탐구하는 과학'];
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  let current=0,paused=motion.matches,hovered=false,timer,request=0;
  const updatePause=()=>{pauseButton.textContent=paused?'▷':'Ⅱ';pauseButton.setAttribute('aria-label',paused?'자동 전환 시작':'자동 전환 일시정지');};
  const schedule=()=>{clearTimeout(timer);if(!paused&&!hovered&&!document.hidden)timer=setTimeout(()=>show(current+1),7000);};
  async function show(next){
    clearTimeout(timer);
    const target=(next+slides.length)%slides.length,token=++request;
    const img=slides[target].querySelector('img');img.loading='eager';
    try{await img.decode();}catch{schedule();return;}
    if(token!==request)return;
    current=target;
    slides.forEach((slide,i)=>{slide.classList.toggle('is-active',i===current);slide.setAttribute('aria-hidden',String(i!==current));});
    indexLabel.textContent=String(current+1).padStart(2,'0')+' / 03';
    caption.textContent=meanings[current];
    schedule();
  }
  gallery.querySelector('[data-slide="prev"]').addEventListener('click',()=>show(current-1));
  gallery.querySelector('[data-slide="next"]').addEventListener('click',()=>show(current+1));
  pauseButton.addEventListener('click',()=>{paused=!paused;updatePause();schedule();});
  gallery.addEventListener('mouseenter',()=>{hovered=true;schedule();});
  gallery.addEventListener('mouseleave',()=>{hovered=false;schedule();});
  gallery.addEventListener('focusin',event=>{if(event.target.matches(':focus-visible')){paused=true;updatePause();schedule();}});
  gallery.addEventListener('keydown',event=>{if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();show(current+(event.key==='ArrowLeft'?-1:1));}});
  document.addEventListener('visibilitychange',schedule);
  motion.addEventListener('change',()=>{if(motion.matches){paused=true;updatePause();schedule();}});
  toolbar.hidden=false;updatePause();schedule();
});
