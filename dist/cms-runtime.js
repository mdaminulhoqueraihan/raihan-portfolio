(()=>{
  const config=window.PORTFOLIO_SUPABASE;
  if(!config||!window.supabase?.createClient)return;

  const db=window.supabase.createClient(config.url,config.key,{
    auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}
  });
  window.portfolioDb=db;
  document.dispatchEvent(new CustomEvent('portfolio:db-ready'));

  const inferPage=()=>{
    const page=document.body?.dataset.cmsPage;
    if(page)return page;
    const part=location.pathname.split('/').filter(Boolean)[0];
    return part||'home';
  };

  const setValue=(element,value,type='text')=>{
    if(type==='html')element.innerHTML=value;
    else element.textContent=value;
  };

  async function applyPublicContent(){
    const page=inferPage();
    const [{data:settings},{data:blocks}]=await Promise.all([
      db.from('site_settings').select('key,value,value_type').eq('is_public',true).order('sort_order'),
      db.from('content_blocks').select('content_key,value,content_type').eq('page_slug',page).eq('published',true).order('sort_order')
    ]);

    (settings||[]).forEach(setting=>{
      document.querySelectorAll(`[data-site-setting="${CSS.escape(setting.key)}"]`).forEach(element=>{
        const mode=element.dataset.settingMode||'text';
        if(mode==='href'){
          const prefix=setting.value_type==='email'?'mailto:':setting.value_type==='phone'?'tel:':'';
          element.setAttribute('href',prefix+setting.value.replace(setting.value_type==='phone'?/\s/g:/^$/g,''));
        }else if(mode==='data-email') element.dataset.email=setting.value;
        else setValue(element,setting.value);
      });
      if(setting.key==='profile.linkedin')document.querySelectorAll('a[href*="linkedin.com/in/md-aminul-hoque-raihan"]').forEach(link=>link.href=setting.value);
      if(setting.key==='profile.email')document.querySelectorAll('a[href^="mailto:mdaminulhoqueraihan"]').forEach(link=>link.href=`mailto:${setting.value}`);
      if(setting.key==='profile.phone')document.querySelectorAll('a[href^="tel:+8801641548560"]').forEach(link=>link.href=`tel:${setting.value.replace(/\s/g,'')}`);
    });

    (blocks||[]).forEach(block=>{
      document.querySelectorAll(`[data-cms-key="${CSS.escape(block.content_key)}"]`).forEach(element=>setValue(element,block.value,block.content_type));
    });
    document.dispatchEvent(new CustomEvent('portfolio:content-ready'));
  }

  applyPublicContent().catch(error=>{
    console.warn('CMS content unavailable; static content remains visible.',error);
    document.dispatchEvent(new CustomEvent('portfolio:content-error'));
  });
})();
