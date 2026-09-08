const q=(selector,parent=document)=>parent.querySelector(selector);
const qa=(selector,parent=document)=>[...parent.querySelectorAll(selector)];

const capabilityData={
  build:{
    index:'01 / BUILD',
    title:'A storefront built around how the business sells.',
    copy:'I translate products, offers and operational needs into a Shopify structure that is responsive, manageable and ready for customers.',
    rows:[
      ['Theme & storefront development','Custom sections, responsive layouts and Shopify theme implementation.'],
      ['Commerce architecture','Products, collections, variants, bundles, apps and purchase flows.'],
      ['Ongoing management','Store operations, maintenance and performance improvement.']
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
    title:'Acquisition connected to the experience after the click.',
    copy:'SEO, paid campaigns and analytics are most useful when they work with the storefront rather than around it.',
    rows:[
      ['SEO delivery','Keyword research, on-page SEO, technical SEO and cross-team coordination.'],
      ['Paid & organic strategy','Meta Ads, Google Ads, social media and creative optimization.'],
      ['Analytics & iteration','Google Analytics, Search Console and performance-led decisions.']
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

qa('.exp-trigger').forEach(button=>button.addEventListener('click',()=>{
  const item=button.closest('.exp-item');
  item.classList.toggle('open');
  button.setAttribute('aria-expanded',item.classList.contains('open'));
}));

const menuButton=q('#menuButton');
menuButton.addEventListener('click',()=>{
  document.body.classList.toggle('menu-open');
  menuButton.setAttribute('aria-expanded',document.body.classList.contains('menu-open'));
});
qa('#navLinks a').forEach(link=>link.addEventListener('click',()=>{
  document.body.classList.remove('menu-open');
  menuButton.setAttribute('aria-expanded','false');
}));

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
