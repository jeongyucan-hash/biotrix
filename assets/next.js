document.documentElement.classList.add('js');
const menu=document.querySelector('.menu-toggle'),nav=document.querySelector('.mobile-nav');
function closeMenu(){if(!menu)return;nav.hidden=true;menu.setAttribute('aria-expanded','false');menu.querySelector('span').textContent='＋';}
menu?.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')==='true';nav.hidden=open;menu.setAttribute('aria-expanded',String(!open));menu.querySelector('span').textContent=open?'＋':'−';});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeMenu();menu?.focus();}});
document.addEventListener('click',e=>{if(menu&&!e.target.closest('.site-header'))closeMenu();});
const selectors=[...document.querySelectorAll('[data-program]')],panels=[...document.querySelectorAll('.program-panel')];
const aliases={mito:'enera',nexus:'flora',immu:'immera',reset:'renova',bioact:'activa'};
function selectProgram(scroll=false){if(!panels.length)return;let id=location.hash.slice(1);id=aliases[id]||id;if(!panels.some(p=>p.id===id))id='enera';panels.forEach(p=>{p.hidden=p.id!==id;});selectors.forEach(a=>{if(a.dataset.program===id){a.setAttribute('aria-current','true');if(scroll)a.scrollIntoView({block:'nearest',inline:'nearest'});}else a.removeAttribute('aria-current');});}
selectProgram();window.addEventListener('hashchange',()=>selectProgram(true));
selectors.forEach(a=>a.addEventListener('click',()=>{if(location.hash==='#'+a.dataset.program)selectProgram(true);}));
