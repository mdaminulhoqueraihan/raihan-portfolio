const q=(selector,parent=document)=>parent.querySelector(selector);
const qa=(selector,parent=document)=>[...parent.querySelectorAll(selector)];

const DEFAULT_PROJECTS=[
  {slug:'august-sabbe',name:'August Sabbe',category:'Fashion / DTC',image:'../assets/projects/august-sabbe.jpg',width:459,height:2048,summary:'A product-led apparel storefront structured around clear discovery, purchase confidence and everyday comfort.'},
  {slug:'jawliner',name:'Jawliner',category:'Wellness / Fitness',image:'../assets/projects/jawliner.jpg',width:266,height:2048,summary:'An education-rich wellness storefront combining product merchandising, expert context, social proof and conversion content.'},
  {slug:'tsc-wardrobe',name:'TSC Wardrobe',category:'Luxury fashion',image:'../assets/projects/tsc-wardrobe.jpg',width:644,height:2048,summary:'A restrained fashion experience built around curated collections, complete-the-look merchandising and brand storytelling.'},
  {slug:'mild-panic',name:'Mild Panic Publishing',category:'Publishing / Pre-order',image:'../assets/projects/mild-panic.jpg',width:936,height:2048,summary:'A focused pre-order experience explaining one guide, its audience, contents and value through a clear sales narrative.'},
  {slug:'green-hands',name:'Green Hands',category:'Plants / Retail',image:'../assets/projects/green-hands.jpg',width:371,height:2048,summary:'A broad plant catalogue organized around product discovery, service trust, category navigation and local delivery.'},
  {slug:'rina-craft',name:"Rina's Craft Creations",category:'Handmade / Lifestyle',image:'../assets/projects/rina-craft-creations.jpg',width:627,height:2048,summary:'A tactile, story-led storefront connecting handmade products, the maker, gifting moments and detailed craftsmanship.'},
  {slug:'shirtley-temple',name:'Shirtley Temple',category:'Apparel / Pop culture',image:'../assets/projects/shirtley-temple.jpg',width:1072,height:2048,summary:'A distinctive graphic apparel store using a bold visual system to make categories, products and brand humour easy to navigate.'},
  {slug:'kingdom-wear',name:'Kingdom Wear',category:'Apparel / Lifestyle',image:'../assets/projects/kingdom-wear.jpg',width:380,height:2048,summary:'A clean apparel storefront balancing collections, product-led discovery, promotional content and customer reassurance.'},
  {slug:'sachika',name:'SACHIKA',category:'Designer fashion',image:'../assets/projects/sachika.jpg',width:837,height:2047,summary:'A fashion-led commerce experience presenting statement collections, category pathways, brand context and editorial media.'},
  {slug:'yesindeed',name:'Yesindeed',category:'Recovery / Wellness',image:'../assets/projects/yesindeed.jpg',width:1038,height:2048,summary:'A product-dense recovery storefront organized by customer need, popular products, bundles and purchase reassurance.'},
  {slug:'camokazi',name:'CAMOKAZI',category:'Leather / Menswear',image:'../assets/projects/camokazi.jpg',width:524,height:2047,summary:'A premium leather storefront balancing hero merchandising, collections, accessories, brand content and trust signals.'},
  {slug:'tulones',name:'Tulones',category:'Streetwear / Apparel',image:'../assets/projects/tulones.jpg',width:777,height:2048,summary:'A direct streetwear shopping experience connecting campaign content, product drops, categories and promotional offers.'},
  {slug:'fnction-calm',name:'FNCTION CALM',category:'Supplements / Product page',image:'../assets/projects/fnction-calm.jpg',width:670,height:2048,summary:'A detailed subscription product page combining product education, offer comparison, expert recommendations, social proof and FAQs.'},
  {slug:'neuromotion',name:'NeuroMotion Support',category:'Wellness / Supplements',image:'../assets/projects/neuromotion.jpg',width:560,height:2048,summary:'A wellness storefront presenting natural support benefits, ingredients, process education, video content and customer reviews.'},
  {slug:'avoiding-anxiety',name:'Avoiding Anxiety Shop',category:'Wellness / Toolkit',image:'../assets/projects/avoiding-anxiety.jpg',width:388,height:2048,summary:'A supportive single-offer storefront guiding visitors through toolkit contents, creator context, benefits, reviews and FAQs.'},
  {slug:'kykr-brands',name:'KYKR Brands',category:'Automotive / Accessories',image:'../assets/projects/kykr-brands.jpg',width:649,height:2048,summary:'A bold automotive accessory storefront built around product protection, vehicle-brand discovery, benefit proof and warranty messaging.'},
  {slug:'always-on-it',name:'Always On It',category:'Wellness / Focus',image:'../assets/projects/always-on-it.jpg',width:387,height:2048,summary:'A dark, youth-focused wellness storefront connecting product positioning, usage moments, comparison content and brand energy.'}
];
let projects=[...DEFAULT_PROJECTS];

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

const previewWindow=q('#previewWindow');
const previewImage=q('#previewImage');
const captureFrame=q('#captureFrame');
const previewProgress=q('#previewProgress');
const togglePreview=q('#togglePreview');
let projectButtons=qa('[data-project]');
const filterButtons=qa('[data-filter]');
const projectRail=q('#projectRail');
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
let activeIndex=0;
let activeFilter='all';
let imageAnimation;
let progressAnimation;
let userPaused=false;
let resizeTimer;

function stopPreview(){
  imageAnimation?.cancel();
  progressAnimation?.cancel();
  imageAnimation=undefined;
  progressAnimation=undefined;
  previewImage.style.transform='translateY(0)';
  previewProgress.style.transform='scaleX(0)';
}

function startPreview(){
  stopPreview();
  if(reducedMotion.matches){
    previewWindow.classList.add('manual-scroll');
    togglePreview.textContent='Manual scroll';
    togglePreview.disabled=true;
    return;
  }
  previewWindow.classList.remove('manual-scroll');
  togglePreview.disabled=false;
  const distance=Math.max(0,previewImage.getBoundingClientRect().height-previewWindow.clientHeight);
  if(!distance)return;
  const duration=Math.min(32000,Math.max(15000,distance*6.5));
  imageAnimation=previewImage.animate([{transform:'translateY(0)'},{transform:`translateY(-${distance}px)`}],{duration,easing:'ease-in-out',direction:'alternate',iterations:Infinity});
  progressAnimation=previewProgress.animate([{transform:'scaleX(0)'},{transform:'scaleX(1)'}],{duration,easing:'ease-in-out',direction:'alternate',iterations:Infinity});
  if(userPaused){imageAnimation.pause();progressAnimation.pause()}
  togglePreview.textContent=userPaused?'Resume scroll':'Pause scroll';
  togglePreview.setAttribute('aria-pressed',String(userPaused));
}

function setProject(index){
  activeIndex=(index+projects.length)%projects.length;
  const project=projects[activeIndex];
  userPaused=false;
  stopPreview();
  previewWindow.classList.add('is-loading');
  q('#previewStatus').textContent='Full-page capture';
  q('#previewCategory').textContent=project.category;
  q('#previewTitle').textContent=project.name;
  q('#previewSummary').textContent=project.summary;
  q('#previewOwnership').textContent=project.ownership||'End-to-end';
  q('#previewContribution').textContent=project.contribution||'Planning · Optimization · Design · Development · Copywriting';
  projectButtons.forEach(button=>{
    const active=button.dataset.project===project.slug;
    button.classList.toggle('active',active);
    button.setAttribute('aria-pressed',String(active));
  });
  const activeButton=projectButtons.find(button=>button.dataset.project===project.slug);
  activeButton?.scrollIntoView({behavior:reducedMotion.matches?'auto':'smooth',block:'nearest',inline:'center'});
  previewImage.width=project.width;
  previewImage.height=project.height;
  captureFrame.style.setProperty('--capture-width',project.width+'px');
  previewWindow.style.setProperty('--preview-bg',`url("${project.image}")`);
  previewImage.alt=`Full-page capture of the ${project.name} e-commerce storefront`;
  let ready=false;
  const onReady=()=>{if(ready)return;ready=true;previewWindow.classList.remove('is-loading');startPreview()};
  previewImage.addEventListener('load',onReady,{once:true});
  previewImage.src=project.image;
  if(previewImage.complete)onReady();
}

function bindProjectButtons(){
  projectButtons.forEach((button,index)=>button.addEventListener('click',()=>setProject(index)));
}
bindProjectButtons();
function visibleIndexes(){
  return projectButtons.map((button,index)=>button.hidden?null:index).filter(index=>index!==null);
}
function stepProject(direction){
  const visible=visibleIndexes();
  const current=visible.indexOf(activeIndex);
  const next=current<0?0:(current+direction+visible.length)%visible.length;
  setProject(visible[next]);
}
q('#previousProject').addEventListener('click',()=>stepProject(-1));
q('#nextProject').addEventListener('click',()=>stepProject(1));
filterButtons.forEach(button=>button.addEventListener('click',()=>{
  activeFilter=button.dataset.filter;
  filterButtons.forEach(item=>{
    const active=item===button;
    item.classList.toggle('active',active);
    item.setAttribute('aria-pressed',String(active));
  });
  projectButtons.forEach(item=>item.hidden=activeFilter!=='all'&&item.dataset.group!==activeFilter);
  const visible=visibleIndexes();
  setProject(visible[0]);
  projectRail.scrollTo({left:0,behavior:reducedMotion.matches?'auto':'smooth'});
}));
q('#railPrevious').addEventListener('click',()=>projectRail.scrollBy({left:-Math.min(560,projectRail.clientWidth*.72),behavior:reducedMotion.matches?'auto':'smooth'}));
q('#railNext').addEventListener('click',()=>projectRail.scrollBy({left:Math.min(560,projectRail.clientWidth*.72),behavior:reducedMotion.matches?'auto':'smooth'}));
togglePreview.addEventListener('click',()=>{
  if(!imageAnimation)return;
  userPaused=!userPaused;
  if(userPaused){imageAnimation.pause();progressAnimation.pause()}else{imageAnimation.play();progressAnimation.play()}
  togglePreview.textContent=userPaused?'Resume scroll':'Pause scroll';
  togglePreview.setAttribute('aria-pressed',String(userPaused));
});
previewWindow.addEventListener('mouseenter',()=>{if(!userPaused){imageAnimation?.pause();progressAnimation?.pause()}});
previewWindow.addEventListener('mouseleave',()=>{if(!userPaused){imageAnimation?.play();progressAnimation?.play()}});
previewWindow.addEventListener('focus',()=>{if(!userPaused){imageAnimation?.pause();progressAnimation?.pause()}});
previewWindow.addEventListener('blur',()=>{if(!userPaused){imageAnimation?.play();progressAnimation?.play()}});
reducedMotion.addEventListener?.('change',startPreview);
addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(startPreview,180)},{passive:true});

if('IntersectionObserver' in window){
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
    if(!imageAnimation||userPaused)return;
    entry.isIntersecting?imageAnimation.play():imageAnimation.pause();
    entry.isIntersecting?progressAnimation.play():progressAnimation.pause();
  }),{threshold:.08});
  observer.observe(previewWindow);
}

function updateScrollProgress(){
  const root=document.documentElement;
  const scrollable=root.scrollHeight-root.clientHeight;
  q('#scrollProgress').style.width=(scrollable?root.scrollTop/scrollable*100:0)+'%';
}
addEventListener('scroll',updateScrollProgress,{passive:true});
updateScrollProgress();

const escapeHtml=value=>String(value??'').replace(/[&<>"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[char]));
async function loadManagedProjects(){
  if(!window.portfolioDb){setProject(0);return}
  const {data,error}=await window.portfolioDb.from('projects').select('*').eq('published',true).order('sort_order');
  if(error||!data?.length){setProject(0);return}
  projects=data.map(project=>({
    slug:project.slug,
    name:project.title,
    category:project.category,
    group:project.group_key,
    image:project.image_url,
    width:project.image_width,
    height:project.image_height,
    summary:project.summary,
    ownership:project.ownership,
    contribution:project.contribution,
    website:project.website_url
  }));
  projectRail.innerHTML=projects.map((project,index)=>`<button class="project-select${index===0?' active':''}" type="button" data-project="${escapeHtml(project.slug)}" data-group="${escapeHtml(project.group)}" aria-pressed="${index===0}"><strong>${escapeHtml(project.name)}</strong><small>${escapeHtml(project.category)}</small></button>`).join('');
  projectButtons=qa('[data-project]');
  bindProjectButtons();
  activeFilter='all';
  setProject(0);
}

const startManagedProjects=()=>loadManagedProjects().catch(error=>{console.warn('Managed projects unavailable; static portfolio remains visible.',error);setProject(0)});
if(window.portfolioDb)startManagedProjects();
else{setProject(0);document.addEventListener('portfolio:db-ready',startManagedProjects,{once:true})}
