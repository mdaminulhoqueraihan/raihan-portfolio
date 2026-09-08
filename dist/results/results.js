const q=(selector,parent=document)=>parent.querySelector(selector);
const qa=(selector,parent=document)=>[...parent.querySelectorAll(selector)];

const DEFAULT_EVIDENCE=[
  {id:'store-sales-a',group:'store',source:'Shopify Analytics',period:'Sep 7, 2025—Sep 7, 2026',metric:'$4,055,273.79',label:'Total sales across the selected 12-month period',context:'The same dashboard records $4.42M gross sales and $3.72M net sales.',details:[['Gross sales','$4,420,419.09'],['Net sales','$3,725,862.03'],['Source','Shopify']],image:'../assets/results/store-sales-4m.png',width:1906,height:589,alt:'Shopify analytics screenshot showing 4,055,273 dollars and 79 cents in total sales'},
  {id:'store-conversion-a',group:'store',source:'Shopify Analytics',period:'Sep 7, 2025—Sep 7, 2026',metric:'2.74%',label:'Online store conversion rate',context:'The funnel records 1,174,433 sessions, 153,648 add-to-carts, 98,175 reached checkout and 32,259 completed sessions.',details:[['Sessions','1,174,433'],['Added to cart','153,648'],['Completed','32,259']],image:'../assets/results/store-conversion-4m.png',width:1905,height:840,alt:'Shopify analytics screenshot showing a 2.74 percent conversion rate and 1,174,433 sessions'},
  {id:'organic-chart-a',group:'seo',source:'Shopify Analytics · Search attribution',period:'Sep 7, 2025—Sep 7, 2026',metric:'$680.3K',label:'Total sales attributed to Google search',context:'Google is shown as a major order referrer inside a $4.05M total-sales report.',details:[['Channel','Search · Google'],['Attributed sales','$680.3K'],['Source','Shopify']],image:'../assets/results/organic-revenue-chart-680k.png',width:1919,height:829,alt:'Shopify report chart showing 680,300 dollars in sales attributed to Google search'},
  {id:'organic-table-a',group:'seo',source:'Shopify Analytics · Search attribution',period:'Sep 7, 2025—Sep 7, 2026',metric:'$690,018.44',label:'Total sales attributed to organic search sources',context:'The report lists 6,318 search-attributed orders, led by Google with $680,319.93 in total sales.',details:[['Search orders','6,318'],['Google sales','$680,319.93'],['Search net sales','$634,466.42']],image:'../assets/results/organic-revenue-table-690k.png',width:1919,height:830,alt:'Shopify report table showing 690,018 dollars and 44 cents in search-attributed sales'},
  {id:'store-sales-b',group:'store',source:'Shopify Analytics',period:'Sep 7, 2025—Sep 7, 2026',metric:'$3,588,131.41',label:'Total sales across a second supplied store dashboard',context:'The dashboard also shows 87,849 orders, 69,702 fulfilled orders and an 18.62% returning-customer rate.',details:[['Orders','87,849'],['Orders fulfilled','69,702'],['Returning customers','18.62%']],image:'../assets/results/store-sales-3m.png',width:1912,height:692,alt:'Shopify analytics screenshot showing 3,588,131 dollars and 41 cents in total sales'},
  {id:'organic-table-b',group:'seo',source:'Shopify Analytics · Search attribution',period:'Sep 7, 2025—Sep 7, 2026',metric:'$452,776.11',label:'Search-attributed sales in a second supplied store report',context:'Google contributes $415,876.71 of the total; DuckDuckGo, Bing, Yahoo and Ecosia are also recorded.',details:[['Search orders','9,974'],['Google sales','$415,876.71'],['Search net sales','$406,846.50']],image:'../assets/results/organic-revenue-table-452k.png',width:1919,height:799,alt:'Shopify report table showing 452,776 dollars and 11 cents in search-attributed sales'},
  {id:'meta-purchases',group:'ads',source:'Meta Ads Manager',period:'Supplied campaign capture',metric:'7 purchases',label:'Website purchases at $0.99 cost per purchase',context:'The selected ad row shows $6.96 spent and seven recorded website purchases.',details:[['Cost per purchase','$0.99'],['Amount spent','$6.96'],['Result','Website purchase']],image:'../assets/results/meta-purchases.png',width:1855,height:582,alt:'Meta Ads Manager screenshot showing seven website purchases at 99 cents per purchase'},
  {id:'meta-leads-108',group:'ads',source:'Meta Ads Manager',period:'Maximum account range shown: Aug 8, 2023—Sep 8, 2026',metric:'108 leads',label:'Lead-form results at $0.22 per lead',context:'The supplied campaign view records 108 lead-form results for the selected campaign row.',details:[['Cost per lead','$0.22'],['Result type','Lead form'],['Platform','Meta Ads']],image:'../assets/results/meta-leads-108.png',width:1862,height:871,alt:'Meta Ads Manager screenshot showing 108 lead-form results at 22 cents per lead'},
  {id:'meta-leads-280',group:'ads',source:'Meta Ads Manager',period:'Maximum account range shown: Aug 8, 2023—Sep 8, 2026',metric:'280 leads',label:'Lead-form results at $0.66 per lead',context:'The supplied ad-set view records 280 lead-form results for the selected row.',details:[['Cost per lead','$0.66'],['Result type','Lead form'],['Platform','Meta Ads']],image:'../assets/results/meta-leads-280.png',width:1864,height:794,alt:'Meta Ads Manager screenshot showing 280 lead-form results at 66 cents per lead'},
  {id:'meta-leads-280-detail',group:'ads',source:'Meta Ads Manager',period:'Maximum account range shown: Aug 8, 2023—Sep 8, 2026',metric:'$0.66 CPL',label:'Campaign-level lead set detail',context:'A second supplied view confirms the 280-lead row alongside lower-volume variants.',details:[['Primary result','280 leads'],['Primary CPL','$0.66'],['Platform','Meta Ads']],image:'../assets/results/meta-leads-280-detail.png',width:1863,height:796,alt:'Meta Ads Manager campaign detail showing a 280-lead ad set at 66 cents per lead'},
  {id:'meta-leads-74',group:'ads',source:'Meta Ads Manager',period:'Maximum account range shown: Aug 8, 2023—Sep 8, 2026',metric:'74 leads',label:'Lead-form results at $0.14 per lead',context:'Two additional rows in the supplied view record four leads at $0.08 and seven leads at $0.26.',details:[['Cost per lead','$0.14'],['Additional CPL','$0.08'],['Additional CPL','$0.26']],image:'../assets/results/meta-leads-74.png',width:1816,height:681,alt:'Meta Ads Manager screenshot showing 74 lead-form results at 14 cents per lead'},
  {id:'meta-leads-74-detail',group:'ads',source:'Meta Ads Manager',period:'Maximum account range shown: Aug 8, 2023—Sep 8, 2026',metric:'$0.08—$0.26',label:'Low-cost lead range across three selected ad rows',context:'The supplied detail view shows 74, four and seven lead-form results across three rows.',details:[['Largest row','74 leads'],['Other rows','4 and 7 leads'],['Platform','Meta Ads']],image:'../assets/results/meta-leads-74-detail.png',width:1850,height:647,alt:'Meta Ads Manager detail showing lead costs between eight and twenty-six cents'},
  {id:'meta-recall',group:'ads',source:'Meta Ads Manager',period:'Maximum account range shown: Aug 8, 2023—Sep 8, 2026',metric:'4,470',label:'Estimated ad recall lift at $0.003 per result',context:'The same supplied view also records 1,130 and 450 estimated ad-recall-lift results at $0.003 each.',details:[['Cost per result','$0.003'],['Other results','1,130 and 450'],['Result type','Ad recall lift']],image:'../assets/results/meta-recall-lift.png',width:1863,height:646,alt:'Meta Ads Manager screenshot showing 4,470 estimated ad recall lift results at 0.003 dollars each'},
  {id:'meta-thruplays',group:'ads',source:'Meta Ads Manager',period:'Maximum account range shown: Aug 8, 2023—Sep 8, 2026',metric:'5,696',label:'Video ThruPlays at $0.001 per result',context:'The supplied view also records 5,427 and 3,596 ThruPlays at the same displayed cost per result.',details:[['Cost per ThruPlay','$0.001'],['Other results','5,427 and 3,596'],['Result type','ThruPlay']],image:'../assets/results/meta-thruplays.png',width:1849,height:770,alt:'Meta Ads Manager screenshot showing 5,696 video ThruPlays at 0.001 dollars each'}
];
let evidence=[...DEFAULT_EVIDENCE];

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
  const track=q('[data-announcement-track]',announcementSlider);
  const slides=qa('span',track);
  let index=0;
  let timer;
  const show=value=>{index=(value+slides.length)%slides.length;track.style.transform=`translateX(-${index*100}%)`};
  const stop=()=>clearInterval(timer);
  const start=()=>{stop();if(matchMedia('(max-width: 760px)').matches&&!matchMedia('(prefers-reduced-motion: reduce)').matches)timer=setInterval(()=>show(index+1),4500)};
  q('[data-announcement-prev]',announcementSlider).addEventListener('click',()=>{show(index-1);start()});
  q('[data-announcement-next]',announcementSlider).addEventListener('click',()=>{show(index+1);start()});
  addEventListener('resize',start,{passive:true});
  document.addEventListener('visibilitychange',()=>document.hidden?stop():start());
  start();
}

let selectors=qa('[data-evidence]');
const filters=qa('[data-filter]');
const rail=q('#evidenceRail');
const modal=q('#evidenceModal');
const modalImage=q('#modalImage');
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
let activeIndex=0;
let activeFilter='all';
let lastFocus;

const visibleIndexes=()=>selectors.map((button,index)=>button.hidden?null:index).filter(index=>index!==null);

function renderEvidence(index,scroll=true){
  activeIndex=(index+evidence.length)%evidence.length;
  const item=evidence[activeIndex];
  q('#evidenceSource').textContent=item.source;
  q('#evidencePeriod').textContent=item.period;
  q('#evidenceMetric').textContent=item.metric;
  q('#evidenceLabel').textContent=item.label;
  q('#evidenceContext').textContent=item.context;
  q('#metricDetails').innerHTML=item.details.map(detail=>`<div><dt>${detail[0]}</dt><dd>${detail[1]}</dd></div>`).join('');
  q('#evidencePosition').textContent=String(visibleIndexes().indexOf(activeIndex)+1).padStart(2,'0');
  q('#evidenceTotal').textContent=String(visibleIndexes().length).padStart(2,'0');
  q('#evidenceFileLabel').textContent=`Dashboard capture · ${String(activeIndex+1).padStart(2,'0')}`;
  const image=q('#evidenceImage');
  image.src=item.image;
  image.width=item.width;
  image.height=item.height;
  image.alt=item.alt;
  selectors.forEach((button,buttonIndex)=>{
    const active=buttonIndex===activeIndex;
    button.classList.toggle('active',active);
    button.setAttribute('aria-pressed',String(active));
  });
  if(scroll)selectors[activeIndex]?.scrollIntoView({behavior:reducedMotion.matches?'auto':'smooth',block:'nearest',inline:'center'});
}

function stepEvidence(direction){
  const visible=visibleIndexes();
  const current=visible.indexOf(activeIndex);
  renderEvidence(visible[current<0?0:(current+direction+visible.length)%visible.length]);
}

function applyFilter(value){
  activeFilter=value;
  filters.forEach(button=>{
    const active=button.dataset.filter===value;
    button.classList.toggle('active',active);
    button.setAttribute('aria-pressed',String(active));
  });
  selectors.forEach(button=>button.hidden=value!=='all'&&button.dataset.group!==value);
  const visible=visibleIndexes();
  renderEvidence(visible[0],false);
  rail.scrollTo({left:0,behavior:reducedMotion.matches?'auto':'smooth'});
}

function bindEvidenceSelectors(){
  selectors.forEach((button,index)=>button.addEventListener('click',()=>renderEvidence(index)));
}
bindEvidenceSelectors();
filters.forEach(button=>button.addEventListener('click',()=>applyFilter(button.dataset.filter)));
q('#previousEvidence').addEventListener('click',()=>stepEvidence(-1));
q('#nextEvidence').addEventListener('click',()=>stepEvidence(1));
q('#railPrevious').addEventListener('click',()=>rail.scrollBy({left:-Math.min(580,rail.clientWidth*.72),behavior:reducedMotion.matches?'auto':'smooth'}));
q('#railNext').addEventListener('click',()=>rail.scrollBy({left:Math.min(580,rail.clientWidth*.72),behavior:reducedMotion.matches?'auto':'smooth'}));

qa('[data-jump-filter]').forEach(button=>button.addEventListener('click',()=>{
  applyFilter(button.dataset.jumpFilter);
  q('#evidence-room').scrollIntoView({behavior:reducedMotion.matches?'auto':'smooth',block:'start'});
}));

function updateModal(){
  const item=evidence[activeIndex];
  q('#modalSource').textContent=item.source;
  q('#modalTitle').textContent=`${item.metric} · ${item.label}`;
  modalImage.src=item.image;
  modalImage.width=item.width;
  modalImage.height=item.height;
  modalImage.alt=item.alt;
}

function openModal(){
  lastFocus=document.activeElement;
  updateModal();
  modal.classList.add('open');
  modal.setAttribute('aria-hidden','false');
  document.body.classList.add('modal-open');
  q('#closeEvidence').focus();
}

function closeModal(){
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden','true');
  document.body.classList.remove('modal-open');
  lastFocus?.focus();
}

q('#openEvidence').addEventListener('click',openModal);
q('#evidenceVisual').addEventListener('click',openModal);
q('#closeEvidence').addEventListener('click',closeModal);
q('[data-close-modal]').addEventListener('click',closeModal);
q('#modalPrevious').addEventListener('click',()=>{stepEvidence(-1);updateModal()});
q('#modalNext').addEventListener('click',()=>{stepEvidence(1);updateModal()});
document.addEventListener('keydown',event=>{
  if(!modal.classList.contains('open'))return;
  if(event.key==='Escape')closeModal();
  if(event.key==='ArrowLeft'){stepEvidence(-1);updateModal()}
  if(event.key==='ArrowRight'){stepEvidence(1);updateModal()}
  if(event.key==='Tab'){
    const focusable=qa('button',modal);
    const first=focusable[0];
    const last=focusable[focusable.length-1];
    if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}
    else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}
  }
});

function updateScrollProgress(){
  const root=document.documentElement;
  const scrollable=root.scrollHeight-root.clientHeight;
  q('#scrollProgress').style.width=(scrollable?root.scrollTop/scrollable*100:0)+'%';
}
addEventListener('scroll',updateScrollProgress,{passive:true});
updateScrollProgress();

const escapeHtml=value=>String(value??'').replace(/[&<>"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[char]));
async function loadManagedEvidence(){
  if(!window.portfolioDb){renderEvidence(0,false);return}
  const {data,error}=await window.portfolioDb.from('results').select('*').eq('published',true).order('sort_order');
  if(error||!data?.length){renderEvidence(0,false);return}
  evidence=data.map(item=>({
    id:item.slug,
    group:item.group_key,
    source:item.source,
    period:item.period,
    metric:item.metric,
    label:item.label,
    context:item.context,
    details:Array.isArray(item.details)?item.details:[],
    image:item.image_url,
    width:item.image_width,
    height:item.image_height,
    alt:item.image_alt
  }));
  rail.innerHTML=evidence.map((item,index)=>`<button class="evidence-select${index===0?' active':''}" type="button" data-evidence="${escapeHtml(item.id)}" data-group="${escapeHtml(item.group)}" aria-pressed="${index===0}"><span>${String(index+1).padStart(2,'0')}</span><strong>${escapeHtml(item.metric)}</strong><small>${escapeHtml(item.source)}</small></button>`).join('');
  selectors=qa('[data-evidence]');
  bindEvidenceSelectors();
  activeFilter='all';
  renderEvidence(0,false);
}

const startManagedEvidence=()=>loadManagedEvidence().catch(error=>{console.warn('Managed evidence unavailable; static evidence remains visible.',error);renderEvidence(0,false)});
if(window.portfolioDb)startManagedEvidence();
else{renderEvidence(0,false);document.addEventListener('portfolio:db-ready',startManagedEvidence,{once:true})}
