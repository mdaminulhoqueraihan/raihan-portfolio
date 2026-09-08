const q=(selector,parent=document)=>parent.querySelector(selector);
const qa=(selector,parent=document)=>[...parent.querySelectorAll(selector)];

const menuButton=q('#menuButton');
if(menuButton){
  menuButton.addEventListener('click',()=>{
    document.body.classList.toggle('menu-open');
    menuButton.setAttribute('aria-expanded',document.body.classList.contains('menu-open'));
  });
  qa('#navLinks a').forEach(link=>link.addEventListener('click',()=>{
    document.body.classList.remove('menu-open');
    menuButton.setAttribute('aria-expanded','false');
  }));
}

const announcementSlider=q('[data-announcement-slider]');
if(announcementSlider){
  const track=q('[data-announcement-track]',announcementSlider);
  const slides=qa('span',track);
  let index=0;
  let timer;
  const show=next=>{index=(next+slides.length)%slides.length;track.style.transform=`translateX(-${index*100}%)`};
  const stop=()=>clearInterval(timer);
  const start=()=>{stop();if(matchMedia('(max-width: 760px)').matches&&!matchMedia('(prefers-reduced-motion: reduce)').matches)timer=setInterval(()=>show(index+1),4500)};
  q('[data-announcement-prev]',announcementSlider).addEventListener('click',()=>{show(index-1);start()});
  q('[data-announcement-next]',announcementSlider).addEventListener('click',()=>{show(index+1);start()});
  addEventListener('resize',start,{passive:true});
  document.addEventListener('visibilitychange',()=>document.hidden?stop():start());
  start();
}

if('IntersectionObserver' in window){
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
    if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target)}
  }),{threshold:.08});
  qa('.reveal').forEach(element=>observer.observe(element));
}else qa('.reveal').forEach(element=>element.classList.add('visible'));

function updateScrollProgress(){
  const root=document.documentElement;
  const scrollable=root.scrollHeight-root.clientHeight;
  q('#scrollProgress').style.width=(scrollable?root.scrollTop/scrollable*100:0)+'%';
}
addEventListener('scroll',updateScrollProgress,{passive:true});
updateScrollProgress();

const escapeHtml=value=>String(value??'').replace(/[&<>"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[char]));

async function loadManagedExperience(){
  if(!window.portfolioDb)return;
  const {data,error}=await window.portfolioDb.from('experience_items').select('*').eq('published',true).order('sort_order');
  if(error||!data?.length)return;
  const ledger=q('#roleLedger');
  ledger.innerHTML=data.map((role,index)=>`<article class="role-entry reveal visible" id="role-${escapeHtml(role.slug)}"><div class="role-date"><strong>${escapeHtml(role.date_start)}</strong><span>${escapeHtml(role.date_end)}</span></div><div class="role-main"><div class="role-label"><span>${escapeHtml(role.organization)}</span><b>${String(index+1).padStart(2,'0')}</b></div><h3>${escapeHtml(role.title)}</h3><p>${escapeHtml(role.summary)}</p><ul>${(role.items||[]).map(item=>`<li>${escapeHtml(item)}</li>`).join('')}</ul><div class="role-links"><a href="../contact/">Discuss an opportunity ↗</a></div></div></article>`).join('');
  const index=q('.career-index');
  if(index)index.innerHTML=`<span class="label">Timeline</span>${data.map(role=>`<a href="#role-${escapeHtml(role.slug)}"><b>${escapeHtml(role.date_start)}—${escapeHtml(role.date_end)}</b>${escapeHtml(role.title)}</a>`).join('')}`;
}

const startManagedExperience=()=>loadManagedExperience().catch(error=>console.warn('Managed experience unavailable; static career record remains visible.',error));
if(window.portfolioDb)startManagedExperience();
else document.addEventListener('portfolio:db-ready',startManagedExperience,{once:true});
