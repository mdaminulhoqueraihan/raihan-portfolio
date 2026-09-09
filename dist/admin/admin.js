(()=>{
  const OWNER_EMAIL='mdaminulhoqueraihan@gmail.com';
  const config=window.PORTFOLIO_SUPABASE;
  const $=(selector,parent=document)=>parent.querySelector(selector);
  const $$=(selector,parent=document)=>[...parent.querySelectorAll(selector)];
  const escapeHtml=value=>String(value??'').replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
  const db=config&&window.supabase?.createClient(config.url,config.key,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
  let session=null;
  let activeSection='overview';
  let currentRows=[];
  let currentRecord=null;
  let toastTimer;

  window.PORTFOLIO_ADMIN_READY=true;

  const sectionInfo={
    overview:['Portfolio CMS','Overview'],content:['Website copy','Page content'],services:['Capabilities','Services'],experience:['Career record','Experience'],projects:['Selected work','Portfolio work'],results:['Performance archive','Results'],inquiries:['Contact pipeline','Inquiries'],media:['Asset management','Media library'],settings:['Global content','Site settings']
  };

  const schemas={
    content:{table:'content_blocks',primary:'label',secondary:'value',meta:'page_slug',order:'sort_order',description:'Edit the key headings and copy used across the public pages.',fields:[
      ['page_slug','Page','select',['home','services','experience','contact'],false],['content_key','Content key','text',null,false],['label','Admin label','text',null,false],['value','Website content','textarea',null,true],['content_type','Content type','select',['text','textarea','html'],false],['sort_order','Sort order','number',null,false],['published','Published','checkbox',null,false]
    ]},
    services:{table:'services',primary:'title',secondary:'description',meta:'eyebrow',order:'sort_order',description:'Manage every service shown on the Services page.',fields:[
      ['slug','Slug','text',null,false],['eyebrow','Category label','text',null,false],['title','Service title','text',null,false],['description','Description','textarea',null,true],['items','Scope items (one per line)','lines',null,true],['sort_order','Sort order','number',null,false],['published','Published','checkbox',null,false]
    ]},
    experience:{table:'experience_items',primary:'title',secondary:'summary',meta:'organization',order:'sort_order',description:'Manage roles, responsibilities and timeline entries.',fields:[
      ['slug','Slug','text',null,false],['date_start','Start','text',null,false],['date_end','End','text',null,false],['organization','Organization / context','text',null,true],['title','Role title','text',null,true],['summary','Summary','textarea',null,true],['items','Responsibilities (one per line)','lines',null,true],['sort_order','Sort order','number',null,false],['published','Published','checkbox',null,false]
    ]},
    projects:{table:'projects',primary:'title',secondary:'summary',meta:'category',order:'sort_order',description:'Add, reorder, publish and update the storefront previews on the Work page.',fields:[
      ['slug','Slug','text',null,false],['title','Project title','text',null,false],['category','Category label','text',null,false],['group_key','Filter group','select',['fashion','wellness','retail','custom'],false],['summary','Project summary','textarea',null,true],['image_url','Screenshot URL','url',null,true],['image_alt','Image alt text','text',null,true],['image_width','Image width','number',null,false],['image_height','Image height','number',null,false],['website_url','Live website URL (optional)','url',null,true],['ownership','Ownership','text',null,false],['contribution','Contribution','text',null,true],['sort_order','Sort order','number',null,false],['published','Published','checkbox',null,false]
    ]},
    results:{table:'results',primary:'metric',secondary:'label',meta:'source',order:'sort_order',description:'Manage verified store, organic-search and advertising evidence.',fields:[
      ['slug','Slug','text',null,false],['group_key','Evidence group','select',['store','seo','ads','other'],false],['source','Source','text',null,false],['period','Period','text',null,true],['metric','Primary metric','text',null,false],['label','Metric explanation','text',null,true],['context','Context','textarea',null,true],['details','Details (Label | Value, one per line)','details',null,true],['image_url','Evidence image URL','url',null,true],['image_alt','Image alt text','text',null,true],['image_width','Image width','number',null,false],['image_height','Image height','number',null,false],['sort_order','Sort order','number',null,false],['published','Published','checkbox',null,false]
    ]},
    settings:{table:'site_settings',primary:'label',secondary:'value',meta:'key',order:'sort_order',description:'Update global contact details, availability and footer information.',fields:[
      ['key','Setting key','text',null,false],['label','Admin label','text',null,false],['value','Public value','textarea',null,true],['value_type','Value type','select',['text','email','phone','url','number','textarea'],false],['sort_order','Sort order','number',null,false],['is_public','Public','checkbox',null,false]
    ]}
  };

  function showToast(message,error=false){
    const toast=$('#toast');
    toast.textContent=message;
    toast.classList.toggle('error',error);
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer=setTimeout(()=>toast.classList.remove('show'),3200);
  }

  function setAuthStatus(message,error=false){
    const status=$('#authStatus');
    status.textContent=message;
    status.classList.toggle('error',error);
  }

  async function verifyAndEnter(nextSession){
    if(!nextSession)return;
    const {data,error}=await db.from('admin_users').select('user_id,email').eq('user_id',nextSession.user.id).maybeSingle();
    if(error||!data){
      await db.auth.signOut();
      setAuthStatus('This account is not authorized for the portfolio admin.',true);
      return;
    }
    session=nextSession;
    $('#ownerEmail').textContent=data.email;
    $('#authShell').hidden=true;
    $('#adminApp').hidden=false;
    await selectSection(activeSection);
  }

  if(!db){
    setAuthStatus('The admin application could not connect. Refresh the page; if the problem continues, check that scripts are allowed in this browser.',true);
    $('#signInButton').disabled=true;
    $('#setupButton').disabled=true;
    return;
  }

  $('#authForm').addEventListener('submit',async event=>{
    event.preventDefault();
    const button=$('#signInButton');
    button.disabled=true;
    setAuthStatus('Signing in…');
    const {data,error}=await db.auth.signInWithPassword({email:OWNER_EMAIL,password:$('#authPassword').value});
    button.disabled=false;
    if(error){setAuthStatus(error.message,true);return}
    await verifyAndEnter(data.session);
  });

  $('#setupButton').addEventListener('click',async()=>{
    const password=$('#authPassword').value;
    if(password.length<8){setAuthStatus('Choose a password with at least 8 characters.',true);return}
    $('#setupButton').disabled=true;
    setAuthStatus('Creating the authorized owner account…');
    const {data,error}=await db.auth.signUp({email:OWNER_EMAIL,password,options:{emailRedirectTo:`${location.origin}/admin/`}});
    $('#setupButton').disabled=false;
    if(error){setAuthStatus(error.message,true);return}
    if(data.session)await verifyAndEnter(data.session);
    else setAuthStatus('Account created. Confirm the email sent by Supabase, then return here and sign in.');
  });

  $('#signOutButton').addEventListener('click',async()=>{
    await db.auth.signOut();
    session=null;
    $('#adminApp').hidden=true;
    $('#authShell').hidden=false;
    $('#authPassword').value='';
    setAuthStatus('Signed out securely.');
  });

  $$('#adminNav [data-section]').forEach(button=>button.addEventListener('click',()=>selectSection(button.dataset.section)));

  async function selectSection(section){
    activeSection=section;
    $$('#adminNav [data-section]').forEach(button=>button.classList.toggle('active',button.dataset.section===section));
    $('#sectionKicker').textContent=sectionInfo[section][0];
    $('#sectionTitle').textContent=sectionInfo[section][1];
    $('#workspaceBody').innerHTML='<div class="loading">Loading data…</div>';
    if(section==='overview')return loadOverview();
    if(section==='inquiries')return loadInquiries();
    if(section==='media')return loadMedia();
    return loadRecords(section);
  }

  async function count(table,column='id',query){
    let request=db.from(table).select(column,{count:'exact',head:true});
    if(query)request=query(request);
    const {count,error}=await request;
    if(error)throw error;
    return count||0;
  }

  async function loadOverview(){
    try{
      const [projects,results,services,newInquiries,recent]=await Promise.all([
        count('projects'),count('results'),count('services'),count('contact_submissions','id',request=>request.eq('status','new')),
        db.from('contact_submissions').select('id,name,email,intent,status,created_at').order('created_at',{ascending:false}).limit(5)
      ]);
      $('#inquiryBadge').textContent=newInquiries?String(newInquiries):'07';
      $('#workspaceBody').innerHTML=`<div class="section-intro"><div><h2>Everything important, in one place.</h2><p>Update the public portfolio, manage evidence and respond to new opportunities without editing source code.</p></div></div><div class="metric-grid"><article class="metric-card featured"><span>New inquiries</span><strong>${newInquiries}</strong></article><article class="metric-card"><span>Published work</span><strong>${projects}</strong></article><article class="metric-card"><span>Evidence records</span><strong>${results}</strong></article><article class="metric-card"><span>Services</span><strong>${services}</strong></article></div><div class="overview-grid"><section class="panel"><div class="panel-head"><h3>Recent inquiries</h3><button type="button" data-go="inquiries">View inbox ↗</button></div><div class="activity-list">${(recent.data||[]).length?(recent.data||[]).map(item=>`<div class="activity-item"><div><strong>${escapeHtml(item.name)}</strong><span>${escapeHtml(item.intent)} · ${escapeHtml(item.email)}</span></div><time>${new Date(item.created_at).toLocaleDateString()}</time></div>`).join(''):'<div class="activity-item"><span>No inquiries yet.</span></div>'}</div></section><section class="panel"><div class="panel-head"><h3>Quick actions</h3></div><div class="quick-actions"><button type="button" data-go="projects">Add portfolio work<span>Upload a capture and project context</span></button><button type="button" data-go="results">Add evidence<span>Publish a verified dashboard result</span></button><button type="button" data-go="content">Edit website copy<span>Update page headings and text</span></button><button type="button" data-go="media">Upload media<span>Manage screenshots and images</span></button></div></section></div>`;
      $$('[data-go]').forEach(button=>button.addEventListener('click',()=>selectSection(button.dataset.go)));
    }catch(error){renderError(error)}
  }

  async function loadRecords(section){
    const schema=schemas[section];
    const {data,error}=await db.from(schema.table).select('*').order(schema.order||'sort_order');
    if(error)return renderError(error);
    currentRows=data||[];
    renderRecords(section,currentRows);
  }

  function renderRecords(section,rows){
    const schema=schemas[section];
    const canAdd=section!=='settings';
    $('#workspaceBody').innerHTML=`<div class="section-intro"><div><h2>${escapeHtml(sectionInfo[section][1])}</h2><p>${escapeHtml(schema.description)}</p></div></div><div class="toolbar"><input class="search-input" id="recordSearch" type="search" placeholder="Search records" aria-label="Search records"><div class="toolbar-right">${section==='content'?'<select id="pageFilter"><option value="all">All pages</option><option>home</option><option>services</option><option>experience</option><option>contact</option></select>':''}${canAdd?'<button class="button-primary" id="addRecord" type="button">Add new +</button>':''}</div></div><div class="record-list" id="recordList"></div>`;
    const renderList=()=>{
      const term=$('#recordSearch').value.toLowerCase();
      const page=$('#pageFilter')?.value||'all';
      const visible=rows.filter(row=>(page==='all'||row.page_slug===page)&&JSON.stringify(row).toLowerCase().includes(term));
      $('#recordList').innerHTML=visible.length?visible.map(row=>{
        const key=row.id||row.key;
        const published=('published' in row)?row.published:row.is_public;
        return `<article class="record"><div><strong>${escapeHtml(row[schema.primary])}</strong><p>${escapeHtml(String(row[schema.secondary]??'').slice(0,150))}</p></div><div><p>${escapeHtml(String(row[schema.secondary]??''))}</p></div><div class="record-meta"><span class="status-pill${published?'':' draft'}">${published?'Live':'Hidden'}</span><p>${escapeHtml(row[schema.meta]||'')}</p></div><div class="record-actions"><button type="button" data-edit="${escapeHtml(key)}">Edit</button></div></article>`;
      }).join(''):'<div class="loading">No matching records.</div>';
      $$('[data-edit]').forEach(button=>button.addEventListener('click',()=>openEditor(section,rows.find(row=>String(row.id||row.key)===button.dataset.edit))));
    };
    $('#recordSearch').addEventListener('input',renderList);
    $('#pageFilter')?.addEventListener('change',renderList);
    $('#addRecord')?.addEventListener('click',()=>openEditor(section,null));
    renderList();
  }

  function defaultValue(field,section){
    if(field==='published'||field==='is_public')return true;
    if(field==='sort_order')return currentRows.length+1;
    if(field==='image_width')return 1200;
    if(field==='image_height')return section==='projects'?1600:800;
    if(field==='ownership')return 'End-to-end';
    if(field==='contribution')return 'Planning · Optimization · Design · Development · Copywriting';
    return '';
  }

  function openEditor(section,record){
    const schema=schemas[section];
    currentRecord=record;
    $('#editorKicker').textContent=record?'Edit record':'Create record';
    $('#editorTitle').textContent=record?record[schema.primary]:`New ${sectionInfo[section][1].toLowerCase()}`;
    $('#deleteRecord').hidden=!record||section==='settings';
    $('#editorStatus').textContent='';
    $('#editorFields').innerHTML=schema.fields.map(([name,label,type,options,full])=>{
      const value=record?.[name]??defaultValue(name,section);
      if(type==='checkbox')return `<label class="checkbox-field"><input name="${name}" type="checkbox" ${value?'checked':''}><span>${escapeHtml(label)}</span></label>`;
      const classes=`field${full?' full':''}`;
      if(type==='select')return `<label class="${classes}">${escapeHtml(label)}<select name="${name}">${options.map(option=>`<option value="${escapeHtml(option)}" ${String(value)===option?'selected':''}>${escapeHtml(option)}</option>`).join('')}</select></label>`;
      const display=type==='lines'?(value||[]).join('\n'):type==='details'?(value||[]).map(item=>item.join(' | ')).join('\n'):value;
      if(['textarea','lines','details'].includes(type))return `<label class="${classes}">${escapeHtml(label)}<textarea name="${name}" rows="${type==='textarea'?5:7}">${escapeHtml(display)}</textarea>${type==='details'?'<small>Example: Gross sales | $4,420,419.09</small>':''}</label>`;
      return `<label class="${classes}">${escapeHtml(label)}<input name="${name}" type="${type}" value="${escapeHtml(display)}" ${['title','slug','key','content_key','metric','label'].includes(name)?'required':''}></label>`;
    }).join('');
    $('#editorForm').dataset.section=section;
    $('#editorModal').showModal();
  }

  function closeEditor(){
    currentRecord=null;
    $('#editorModal').close();
  }
  $('#closeEditor').addEventListener('click',closeEditor);
  $('#cancelEditor').addEventListener('click',closeEditor);

  $('#editorForm').addEventListener('submit',async event=>{
    event.preventDefault();
    const section=event.currentTarget.dataset.section;
    const schema=schemas[section];
    const formData=new FormData(event.currentTarget);
    const payload={};
    schema.fields.forEach(([name,,type])=>{
      if(type==='checkbox')payload[name]=formData.get(name)==='on';
      else if(type==='number')payload[name]=Number(formData.get(name)||0);
      else if(type==='lines')payload[name]=String(formData.get(name)||'').split('\n').map(v=>v.trim()).filter(Boolean);
      else if(type==='details')payload[name]=String(formData.get(name)||'').split('\n').map(line=>line.split('|').map(v=>v.trim())).filter(parts=>parts[0]&&parts[1]);
      else payload[name]=String(formData.get(name)||'').trim();
    });
    if('updated_by' in (currentRecord||{})||section!=='settings')payload.updated_by=session.user.id;
    $('#saveRecord').disabled=true;
    $('#editorStatus').textContent='Saving…';
    let request;
    if(currentRecord){
      const key=currentRecord.id?'id':'key';
      request=db.from(schema.table).update(payload).eq(key,currentRecord[key]);
    }else request=db.from(schema.table).insert(payload);
    const {error}=await request;
    $('#saveRecord').disabled=false;
    if(error){$('#editorStatus').textContent=error.message;return}
    closeEditor();
    showToast('Changes saved and available to the website.');
    await loadRecords(section);
  });

  $('#deleteRecord').addEventListener('click',async()=>{
    const section=$('#editorForm').dataset.section;
    if(!currentRecord||!confirm('Delete this record permanently?'))return;
    const schema=schemas[section];
    const key=currentRecord.id?'id':'key';
    const {error}=await db.from(schema.table).delete().eq(key,currentRecord[key]);
    if(error){$('#editorStatus').textContent=error.message;return}
    closeEditor();
    showToast('Record deleted.');
    await loadRecords(section);
  });

  async function loadInquiries(){
    const {data,error}=await db.from('contact_submissions').select('*').order('created_at',{ascending:false});
    if(error)return renderError(error);
    currentRows=data||[];
    const counts=currentRows.reduce((all,item)=>({...all,[item.status]:(all[item.status]||0)+1}),{});
    $('#inquiryBadge').textContent=counts.new?String(counts.new):'07';
    $('#workspaceBody').innerHTML=`<div class="section-intro"><div><h2>Contact submissions</h2><p>Every successful public contact form submission appears here. Update the status and keep private response notes.</p></div></div><div class="toolbar"><input class="search-input" id="inquirySearch" type="search" placeholder="Search name, email or brief"><div class="toolbar-right"><select id="inquiryFilter"><option value="all">All statuses</option><option value="new">New (${counts.new||0})</option><option value="read">Read (${counts.read||0})</option><option value="replied">Replied (${counts.replied||0})</option><option value="archived">Archived (${counts.archived||0})</option></select></div></div><div id="inquiryList"></div>`;
    const render=()=>{
      const term=$('#inquirySearch').value.toLowerCase();
      const filter=$('#inquiryFilter').value;
      const items=currentRows.filter(item=>(filter==='all'||item.status===filter)&&JSON.stringify(item).toLowerCase().includes(term));
      $('#inquiryList').innerHTML=items.length?items.map(item=>`<article class="inquiry-card" data-inquiry="${item.id}"><button class="inquiry-summary" type="button" data-open-inquiry="${item.id}"><div><strong>${escapeHtml(item.name)}</strong><span>${escapeHtml(item.email)}</span></div><span>${escapeHtml(item.intent)}</span><time>${new Date(item.created_at).toLocaleString()}</time><b class="status-pill${item.status==='archived'?' draft':''}">${escapeHtml(item.status)}</b></button><div class="inquiry-detail"><div class="inquiry-copy"><strong>${escapeHtml(item.company||'No company')}</strong> · ${escapeHtml(item.website||'No website')}<br><small>${escapeHtml(item.timeline)}</small><br><br>${escapeHtml(item.brief)}</div><div class="inquiry-controls"><label class="field">Status<select data-inquiry-status="${item.id}">${['new','read','replied','archived'].map(status=>`<option ${item.status===status?'selected':''}>${status}</option>`).join('')}</select></label><label class="field">Private notes<textarea data-inquiry-notes="${item.id}" rows="5">${escapeHtml(item.admin_notes)}</textarea></label><a class="mini-button" href="mailto:${encodeURIComponent(item.email)}?subject=${encodeURIComponent(`Re: ${item.intent}`)}">Reply by email ↗</a><button class="mini-button" type="button" data-save-inquiry="${item.id}">Save status & notes</button><button class="mini-button" type="button" data-delete-inquiry="${item.id}">Delete inquiry</button></div></div></article>`).join(''):'<div class="loading">No matching inquiries.</div>';
      $$('[data-open-inquiry]').forEach(button=>button.addEventListener('click',()=>button.closest('.inquiry-card').classList.toggle('open')));
      $$('[data-save-inquiry]').forEach(button=>button.addEventListener('click',()=>saveInquiry(button.dataset.saveInquiry)));
      $$('[data-delete-inquiry]').forEach(button=>button.addEventListener('click',()=>deleteInquiry(button.dataset.deleteInquiry)));
    };
    $('#inquirySearch').addEventListener('input',render);
    $('#inquiryFilter').addEventListener('change',render);
    render();
  }

  async function saveInquiry(id){
    const status=$(`[data-inquiry-status="${id}"]`).value;
    const admin_notes=$(`[data-inquiry-notes="${id}"]`).value.trim();
    const {error}=await db.from('contact_submissions').update({status,admin_notes}).eq('id',id);
    if(error)return showToast(error.message,true);
    showToast('Inquiry updated.');
    await loadInquiries();
  }
  async function deleteInquiry(id){
    if(!confirm('Delete this inquiry permanently?'))return;
    const {error}=await db.from('contact_submissions').delete().eq('id',id);
    if(error)return showToast(error.message,true);
    showToast('Inquiry deleted.');
    await loadInquiries();
  }

  async function loadMedia(){
    const {data,error}=await db.from('media_assets').select('*').order('created_at',{ascending:false});
    if(error)return renderError(error);
    currentRows=data||[];
    $('#workspaceBody').innerHTML=`<div class="section-intro"><div><h2>Media library</h2><p>Upload optimized screenshots or evidence images, then copy the public URL into any project or result record.</p></div></div><form class="media-upload" id="mediaForm"><label class="field">Image file<input id="mediaFile" type="file" accept="image/jpeg,image/png,image/webp,image/gif" required></label><label class="field">Alt text<input id="mediaAlt" type="text" maxlength="300" placeholder="Describe the image" required></label><button class="button-primary" id="uploadMedia" type="submit">Upload image</button></form><div class="media-grid">${currentRows.length?currentRows.map(asset=>`<article class="media-card"><img src="${escapeHtml(asset.public_url)}" alt="${escapeHtml(asset.alt_text)}" loading="lazy"><div class="media-copy"><strong title="${escapeHtml(asset.file_name)}">${escapeHtml(asset.file_name)}</strong><span>${Math.max(1,Math.round(Number(asset.size_bytes)/1024))} KB</span><div class="media-actions"><button class="mini-button" type="button" data-copy-media="${escapeHtml(asset.public_url)}">Copy URL</button><button class="mini-button" type="button" data-delete-media="${asset.id}">Delete</button></div></div></article>`).join(''):'<div class="loading">No uploaded media yet. Existing repository images remain available.</div>'}</div>`;
    $('#mediaForm').addEventListener('submit',uploadMedia);
    $$('[data-copy-media]').forEach(button=>button.addEventListener('click',async()=>{await navigator.clipboard.writeText(button.dataset.copyMedia);showToast('Media URL copied.')}));
    $$('[data-delete-media]').forEach(button=>button.addEventListener('click',()=>deleteMedia(button.dataset.deleteMedia)));
  }

  async function uploadMedia(event){
    event.preventDefault();
    const file=$('#mediaFile').files[0];
    const alt=$('#mediaAlt').value.trim();
    if(!file||!file.type.startsWith('image/'))return showToast('Choose a supported image file.',true);
    if(file.size>10*1024*1024)return showToast('Image must be 10 MB or smaller.',true);
    const button=$('#uploadMedia');
    button.disabled=true;
    button.textContent='Uploading…';
    const safeName=file.name.toLowerCase().replace(/[^a-z0-9._-]+/g,'-');
    const path=`${session.user.id}/${Date.now()}-${safeName}`;
    const {error:uploadError}=await db.storage.from('portfolio-media').upload(path,file,{cacheControl:'31536000',upsert:false});
    if(uploadError){button.disabled=false;button.textContent='Upload image';return showToast(uploadError.message,true)}
    const {data:publicData}=db.storage.from('portfolio-media').getPublicUrl(path);
    const {error:recordError}=await db.from('media_assets').insert({storage_path:path,public_url:publicData.publicUrl,file_name:file.name,mime_type:file.type,size_bytes:file.size,alt_text:alt,created_by:session.user.id});
    button.disabled=false;
    button.textContent='Upload image';
    if(recordError)return showToast(recordError.message,true);
    showToast('Image uploaded.');
    await loadMedia();
  }

  async function deleteMedia(id){
    const asset=currentRows.find(item=>item.id===id);
    if(!asset||!confirm('Delete this uploaded image? Existing pages using its URL may show a broken image.'))return;
    const {error:storageError}=await db.storage.from('portfolio-media').remove([asset.storage_path]);
    if(storageError)return showToast(storageError.message,true);
    const {error}=await db.from('media_assets').delete().eq('id',id);
    if(error)return showToast(error.message,true);
    showToast('Media deleted.');
    await loadMedia();
  }

  function renderError(error){
    console.error(error);
    $('#workspaceBody').innerHTML=`<div class="loading">Unable to load this section: ${escapeHtml(error.message||'Unknown error')}</div>`;
  }

  db.auth.getSession().then(({data})=>data.session&&verifyAndEnter(data.session));
  db.auth.onAuthStateChange((event,nextSession)=>{
    if(event==='SIGNED_OUT')session=null;
    if(event==='TOKEN_REFRESHED')session=nextSession;
  });
})();
