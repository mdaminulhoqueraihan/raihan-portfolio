const q=(selector,parent=document)=>parent.querySelector(selector);
const qa=(selector,parent=document)=>[...parent.querySelectorAll(selector)];

const capabilityData={
  build:{
    index:'01 / BUILD',
    title:'A website built around what the business needs to achieve.',
    copy:'I translate the offer, audience and operational needs into a responsive Shopify store or custom website that is clear, maintainable and ready to perform.',
    rows:[
      ['Shopify storefront development','Custom sections, responsive layouts and Shopify theme implementation.'],
      ['Custom website development','Brand-led business websites and landing experiences built around the required functionality.'],
      ['Experience architecture','Pages, content hierarchy, navigation and conversion paths.']
    ]
  },
  optimize:{
    index:'02 / OPTIMIZE',
    title:'A buying journey with less confusion and less friction.',
    copy:'I use UX and CRO thinking to make the offer easier to understand, the products easier to compare and the next action easier to take.',
    rows:[
      ['Conversion-focused UX','Hierarchy, mobile experience, trust, product discovery and offer presentation.'],
      ['Landing pages & funnels','Focused journeys connecting campaign intent with the right purchase action.'],
      ['Performance improvement','Usability, speed considerations and evidence-led iteration.']
    ]
  },
  grow:{
    index:'03 / GROW',
    title:'Digital marketing connected to the experience after the click.',
    copy:'I plan and manage campaigns, creative direction, landing journeys and performance priorities around one measurable business goal.',
    rows:[
      ['Digital marketing campaigns','Paid and organic campaign planning, execution and ongoing improvement.'],
      ['Creative & landing alignment','Advertising message, creative and post-click experience kept connected.'],
      ['Performance management','Campaign reporting plus SEO and analytics oversight used to guide priorities.']
    ]
  }
};

function renderCapability(key){
  const item=capabilityData[key];
  q('#capIndex').textContent=item.index;
  q('#capTitle').textContent=item.title;
  q('#capCopy').textContent=item.copy;
  q('#capList').innerHTML=item.rows.map((row,index)=>`<div class="cap-row"><b>0${index+1}</b><div><strong>${row[0]}</strong><span>${row[1]}</span></div></div>`).join('');
}

renderCapability('build');
qa('[data-capability]').forEach(button=>button.addEventListener('click',()=>{
  qa('[data-capability]').forEach(item=>{
    item.classList.remove('active');
    item.setAttribute('aria-selected','false');
  });
  button.classList.add('active');
  button.setAttribute('aria-selected','true');
  q('#capabilityPanel').setAttribute('aria-labelledby',button.id);
  renderCapability(button.dataset.capability);
}));
qa('[data-capability]').forEach((button,index,buttons)=>button.addEventListener('keydown',event=>{
  if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
  event.preventDefault();
  const nextIndex=event.key==='Home'?0:event.key==='End'?buttons.length-1:(index+(event.key==='ArrowRight'?1:-1)+buttons.length)%buttons.length;
  buttons[nextIndex].focus();
  buttons[nextIndex].click();
}));

function bindExperienceTriggers(){
  qa('.exp-trigger').forEach(button=>button.addEventListener('click',()=>{
    const item=button.closest('.exp-item');
    item.classList.toggle('open');
    button.setAttribute('aria-expanded',item.classList.contains('open'));
  }));
}
bindExperienceTriggers();

const menuButton=q('#menuButton');
menuButton.addEventListener('click',()=>{
  document.body.classList.toggle('menu-open');
  menuButton.setAttribute('aria-expanded',document.body.classList.contains('menu-open'));
});
qa('#navLinks a').forEach(link=>link.addEventListener('click',()=>{
  document.body.classList.remove('menu-open');
  menuButton.setAttribute('aria-expanded','false');
}));

const announcementSlider=q('[data-announcement-slider]');
if(announcementSlider){
  const announcementTrack=q('[data-announcement-track]',announcementSlider);
  const announcementSlides=qa('span',announcementTrack);
  let announcementIndex=0;
  let announcementTimer;
  const showAnnouncement=index=>{
    announcementIndex=(index+announcementSlides.length)%announcementSlides.length;
    announcementTrack.style.transform=`translateX(-${announcementIndex*100}%)`;
  };
  const stopAnnouncements=()=>clearInterval(announcementTimer);
  const startAnnouncements=()=>{
    stopAnnouncements();
    if(matchMedia('(max-width: 760px)').matches&&!matchMedia('(prefers-reduced-motion: reduce)').matches){
      announcementTimer=setInterval(()=>showAnnouncement(announcementIndex+1),4500);
    }
  };
  q('[data-announcement-prev]',announcementSlider).addEventListener('click',()=>{showAnnouncement(announcementIndex-1);startAnnouncements()});
  q('[data-announcement-next]',announcementSlider).addEventListener('click',()=>{showAnnouncement(announcementIndex+1);startAnnouncements()});
  addEventListener('resize',startAnnouncements,{passive:true});
  document.addEventListener('visibilitychange',()=>document.hidden?stopAnnouncements():startAnnouncements());
  startAnnouncements();
}

if('IntersectionObserver' in window){
  const revealObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{
    if(entry.isIntersecting){
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  }),{threshold:.1});
  qa('.reveal').forEach(element=>revealObserver.observe(element));
}else{
  qa('.reveal').forEach(element=>element.classList.add('visible'));
}

function updateScrollProgress(){
  const root=document.documentElement;
  const scrollable=root.scrollHeight-root.clientHeight;
  q('#scrollProgress').style.width=(scrollable?root.scrollTop/scrollable*100:0)+'%';
}
addEventListener('scroll',updateScrollProgress,{passive:true});
updateScrollProgress();

const escapeHtml=value=>String(value??'').replace(/[&<>"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[char]));
async function loadManagedHomepage(){
  if(!window.portfolioDb)return;
  const [{data:blocks},{data:roles}]=await Promise.all([
    window.portfolioDb.from('content_blocks').select('content_key,value').eq('page_slug','home').eq('published',true).like('content_key','capability.%'),
    window.portfolioDb.from('experience_items').select('*').eq('published',true).order('sort_order')
  ]);
  const values=Object.fromEntries((blocks||[]).map(block=>[block.content_key,block.value]));
  ['build','optimize','grow'].forEach(key=>{
    capabilityData[key].title=values[`capability.${key}.title`]||capabilityData[key].title;
    capabilityData[key].copy=values[`capability.${key}.copy`]||capabilityData[key].copy;
    if(values[`capability.${key}.items`])capabilityData[key].rows=values[`capability.${key}.items`].split('\n').map(line=>line.split('|').map(value=>value.trim())).filter(row=>row[0]&&row[1]);
  });
  const active=q('[data-capability].active')?.dataset.capability||'build';
  renderCapability(active);
  if(roles?.length){
    const list=q('#homeExperienceList');
    list.innerHTML=roles.map((role,index)=>`<article class="exp-item${index===0?' open':''}"><button class="exp-trigger" type="button" aria-expanded="${index===0}" aria-controls="home-role-${escapeHtml(role.slug)}"><span class="exp-date">${escapeHtml(role.date_start)} — ${escapeHtml(role.date_end)}</span><span class="exp-title"><strong>${escapeHtml(role.title)}</strong><span>${escapeHtml(role.organization)}</span></span><span class="exp-icon" aria-hidden="true">+</span></button><div class="exp-body" id="home-role-${escapeHtml(role.slug)}"><div><ul>${(role.items||[]).map(item=>`<li>${escapeHtml(item)}</li>`).join('')}</ul></div></div></article>`).join('');
    bindExperienceTriggers();
  }
}

const startManagedHomepage=()=>loadManagedHomepage().catch(error=>console.warn('Managed homepage content unavailable; static content remains visible.',error));
if(window.portfolioDb)startManagedHomepage();
else document.addEventListener('portfolio:db-ready',startManagedHomepage,{once:true});
