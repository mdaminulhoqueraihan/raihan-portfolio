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

const form=q('#contactForm');
const intentFieldset=q('.intent-fieldset');
if(form){
  qa('input[name="intent"]',form).forEach(input=>input.addEventListener('change',()=>intentFieldset.classList.remove('invalid')));
  form.addEventListener('submit',event=>{
    event.preventDefault();
    const selected=q('input[name="intent"]:checked',form);
    intentFieldset.classList.toggle('invalid',!selected);
    if(!selected||!form.checkValidity()){
      form.reportValidity();
      if(!selected)intentFieldset.scrollIntoView({behavior:'smooth',block:'center'});
      return;
    }
    const data=new FormData(form);
    const subject=`Portfolio inquiry — ${data.get('intent')}`;
    const lines=[
      `Name: ${data.get('name')}`,
      `Email: ${data.get('email')}`,
      `Company / brand: ${data.get('company')||'Not provided'}`,
      `Website: ${data.get('website')||'Not provided'}`,
      `Inquiry type: ${data.get('intent')}`,
      `Preferred timeline: ${data.get('timeline')}`,
      '',
      'Brief:',
      data.get('brief')
    ];
    q('#formStatus').hidden=false;
    const mailto=`mailto:mdaminulhoqueraihan@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\n'))}`;
    setTimeout(()=>{window.location.href=mailto},120);
  });
}

const copyButton=q('#copyEmail');
if(copyButton){
  copyButton.addEventListener('click',async()=>{
    const status=q('#copyStatus');
    try{
      await navigator.clipboard.writeText(copyButton.dataset.email);
      status.textContent='Email address copied.';
      copyButton.textContent='Copied';
    }catch{
      status.textContent='Copy was unavailable. Select the email address above.';
    }
  });
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
