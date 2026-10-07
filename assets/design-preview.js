/* Design-only preview. Uses approved bilingual source copy and immutable CI assets. */
const previewArrow='<svg aria-hidden="true" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="1.5"/></svg>';
const conceptArt=(code)=>{
const id='art-'+code.toLowerCase();
let shape='';
if(code==='ENERA')shape=`<g transform="translate(160 105) rotate(-25)"><ellipse rx="104" ry="50"/><ellipse rx="93" ry="40" opacity=".55"/><path d="M-80 0C-65-50-48 50-32 0S-5-40 10 0 35 40 47 0 68-33 80 0" stroke-width="3"/><circle cx="-39" cy="-13" r="4" fill="currentColor"/><circle cx="40" cy="16" r="3" fill="currentColor"/></g><path d="M33 38h35m-18-18v36M264 156h24m-12-12v24" opacity=".4"/>`;
if(code==='FLORA')shape=`<g transform="translate(160 105)"><circle r="58" stroke-dasharray="2 8"/><circle r="84" opacity=".35"/><g transform="rotate(-28)"><rect x="-43" y="-12" width="86" height="24" rx="12"/><path d="M-22-3h10m9 7h12m8-6h8"/></g><g transform="translate(-81 53) rotate(32)"><rect x="-24" y="-9" width="48" height="18" rx="9"/></g><g transform="translate(73 -56) rotate(55)"><rect x="-28" y="-9" width="56" height="18" rx="9"/></g><circle cx="71" cy="45" r="9"/><circle cx="-56" cy="-51" r="6"/></g>`;
if(code==='IMMERA')shape=`<g transform="translate(160 105)"><path d="M-70-28C-58-78 35-81 64-31S71 65 13 69-83 34-70-28Z"/><path d="M-55-23C-43-64 27-65 51-23S57 53 10 56-66 27-55-23Z" opacity=".5"/><circle cx="0" cy="1" r="25"/><circle cx="-6" cy="-4" r="11" opacity=".5"/><path d="M-70-28l-25-18M64-31l26-17M58 44l22 17M-54 45l-23 22"/><circle cx="-102" cy="-50" r="8"/><circle cx="97" cy="-52" r="7"/><circle cx="86" cy="66" r="6"/><circle cx="-83" cy="72" r="6"/></g>`;
if(code==='RENOVA')shape=`<g transform="translate(40 28)"><path d="M0 28L49 0l48 34 48-15 58 26 39-13M0 91l51-25 49 36 45-38 53 31 44-16M10 140l44-21 46 41 51-43 51 29 34-23M49 0l2 66 3 53M97 34l3 68v58M145 19v45l6 53M203 45l-5 50 4 51"/><g fill="currentColor"><circle cx="49" cy="0" r="5"/><circle cx="97" cy="34" r="5"/><circle cx="145" cy="19" r="4"/><circle cx="51" cy="66" r="7"/><circle cx="100" cy="102" r="8"/><circle cx="145" cy="64" r="6"/><circle cx="198" cy="95" r="6"/><circle cx="54" cy="119" r="5"/><circle cx="151" cy="117" r="5"/></g></g>`;
return `<svg viewBox="0 0 320 210" aria-hidden="true" class="concept-art"><defs><radialGradient id="${id}"><stop stop-color="#c2dcc8" stop-opacity=".12"/><stop offset="1" stop-color="#c2dcc8" stop-opacity="0"/></radialGradient></defs><rect width="320" height="210" fill="url(#${id})"/><g fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">${shape}</g></svg>`;
};
function enhancePreview(){
 const path=location.pathname;
 document.body.classList.add('design-preview');
 const logo=document.querySelector('header .brand img');logo.src='/assets/brand-v04/assets/logo-green-v05.svg';
 document.querySelector('header .brand').setAttribute('aria-label',t('BIOTRIX 홈','BIOTRIX home'));
 let navAction=document.querySelector('.header-contact');if(!navAction){navAction=document.createElement('a');navAction.className='header-contact';navAction.href='/contact';document.querySelector('header').insertBefore(navAction,document.querySelector('.lang'));}navAction.innerHTML=t('협력 제안하기','Collaborate')+previewArrow;
 document.querySelectorAll('.button').forEach(el=>{if(!el.querySelector('svg'))el.insertAdjacentHTML('beforeend',previewArrow)});
 if(path==='/'){
 const hero=document.querySelector('.hero');
 const image=hero.querySelector('.hero-art');
 const figure=document.createElement('figure');figure.className='hero-scene';figure.append(image);
 figure.insertAdjacentHTML('beforeend',`<div class="scene-top"><span>BIOTRIX / BIOLOGY</span><span class="scene-dot"></span></div><div class="scene-orbit" aria-hidden="true"><span></span><span></span></div><figcaption><span>${t('생명현상에서 새로운 가능성으로','From biology to possibility')}</span><span class="scene-caption-mark">↗</span></figcaption>`);hero.append(figure);
 const copy=hero.querySelector('.hero-copy');copy.insertAdjacentHTML('beforeend',`<div class="hero-note"><span class="note-line"></span><span>RESEARCH · DEVELOPMENT · COLLABORATION</span></div>`);
 const ticker=document.querySelector('.ticker');ticker.innerHTML=`<span>OUR FOCUS</span><span>${t('새로운 기능의 발견','Discovering new functions')}</span><span>${t('기능과 전달의 개선','Improving function & delivery')}</span><span>${t('생산성과 경제성 향상','Productivity & economics')}</span>`;
 const direction=document.querySelector('.split');direction.classList.add('direction-section');direction.querySelector('.eyebrow').textContent='01 / DEVELOPMENT';
 const fields=document.querySelector('.dark');fields.classList.add('fields-section');
 fields.querySelectorAll('.field-card').forEach((card,i)=>{const code=card.querySelector('b').textContent;const content=card.innerHTML;card.innerHTML=`<div class="field-visual"><span class="visual-index">0${i+1} / RESEARCH FIELD</span>${conceptArt(code)}<span class="visual-code">${code}</span></div><div class="field-copy">${content}<span class="field-arrow">${previewArrow}</span></div>`;});
 fields.querySelector('.activa').insertAdjacentHTML('afterbegin','<span class="foundation-icon" aria-hidden="true">'+conceptArt('RENOVA')+'</span>');
 }
 if(path==='/research'){
 document.querySelectorAll('.research-detail').forEach(section=>{const code=section.id.toUpperCase();if(code!=='ACTIVA')section.querySelector(':scope > div').insertAdjacentHTML('beforeend',`<div class="detail-art">${conceptArt(code)}</div>`);});
 }
 if(path==='/contact'){
 const types=document.querySelectorAll('.contact-options article');types.forEach((a,i)=>{a.insertAdjacentHTML('beforeend',`<span class="option-mark" aria-hidden="true">${['↗','⇄','⌘','＋'][i]}</span>`)});
 const mail=document.querySelector('.email');if(mail){const wrap=document.createElement('div');wrap.className='email-tools';mail.after(wrap);const button=document.createElement('button');button.className='copy-email';button.type='button';button.textContent=t('이메일 주소 복사','Copy email');const status=document.createElement('span');status.className='copy-status';status.setAttribute('role','status');button.onclick=async()=>{try{await navigator.clipboard.writeText('andrew@biotrix.co.kr');status.textContent=t('복사했습니다','Copied');}catch{status.textContent=t('andrew@biotrix.co.kr 주소를 선택해 복사해 주세요','Select and copy andrew@biotrix.co.kr');}};wrap.append(button,status);}
 const mailLinks=document.querySelectorAll('main a[href="mailto:andrew@biotrix.co.kr"]');mailLinks.forEach(a=>a.href='mailto:andrew@biotrix.co.kr?subject='+encodeURIComponent(t('[BIOTRIX] 협력 제안','[BIOTRIX] Collaboration proposal'))+'&body='+encodeURIComponent(t('소속 / 담당자:\n회신 연락처:\n기술 또는 아이디어 개요:\n현재 단계:\n희망 협력 방식:\n','Organization / name:\nContact details:\nTechnology or idea:\nCurrent stage:\nProposed collaboration:\n')));
 }
 const band=document.querySelector('.contact-band');if(band)band.insertAdjacentHTML('afterbegin','<div class="band-orbit" aria-hidden="true"></div>');
}
const renderApprovedSource=render;
render=function(){renderApprovedSource();enhancePreview()};
enhancePreview();
