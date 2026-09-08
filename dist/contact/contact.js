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
  form.addEventListener('submit',async event=>{
    event.preventDefault();
    const selected=q('input[name="intent"]:checked',form);
    intentFieldset.classList.toggle('invalid',!selected);
    if(!selected||!form.checkValidity()){
      form.reportValidity();
      if(!selected)intentFieldset.scrollIntoView({behavior:'smooth',block:'center'});
      return;
    }
    const data=new FormData(form);
    const submitButton=q('button[type="submit"]',form);
    const status=q('#formStatus');
    submitButton.disabled=true;
    submitButton.textContent='Sending…';
    status.hidden=false;
    status.classList.remove('is-error');
    status.textContent='Sending your brief securely…';
    try{
      if(!window.portfolioDb)throw new Error('The inquiry service is temporarily unavailable.');
      const {error}=await window.portfolioDb.from('contact_submissions').insert({
        name:String(data.get('name')||'').trim(),
        email:String(data.get('email')||'').trim(),
        company:String(data.get('company')||'').trim(),
        website:String(data.get('website')||'').trim(),
        intent:String(data.get('intent')||''),
        timeline:String(data.get('timeline')||''),
        brief:String(data.get('brief')||'').trim(),
        status:'new',
        admin_notes:'',
        user_agent:navigator.userAgent.slice(0,500)
      });
      if(error)throw error;
      form.reset();
      status.textContent='Your brief has been sent. I’ll review the context and respond by email.';
      submitButton.textContent='Brief sent ✓';
    }catch(error){
      console.error('Inquiry submission failed',error);
      status.classList.add('is-error');
      status.textContent='The brief could not be sent right now. Please email me directly using the address below.';
      submitButton.disabled=false;
      submitButton.textContent='Try again ↗';
    }
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
