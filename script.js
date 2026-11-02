const toast=document.getElementById('toast');let timer;
function notify(message){toast.textContent=message;toast.classList.add('show');clearTimeout(timer);timer=setTimeout(()=>toast.classList.remove('show'),2600);}
const main=document.querySelector('.content'),topbar=document.querySelector('.topbar');
const originalDashboard=[...main.children].filter(el=>el!==topbar&&!el.classList.contains('dynamic-view'));
const pageInfo={
'Photo Selection':['Photo Selection','Create an event and let clients choose their favourite photos.','photo-selection'],
'Invitation':['Invitation','Create and manage digital invitations for your events.','invitation'],
'Digital Album':['Digital Album','Create, organize and share digital albums.','digital-album'],
'AI Face Recognition':['AI Face Recognition','Find photos by face and organize your client galleries.','ai-face'],
'AI Subscription':['AI Subscription','Review AI tools and subscription options.','subscription'],
'My Subscription':['My Subscription','View your current plan and usage details.','my-subscription'],
'AI-Access':['AI-Access','Manage access to AI-powered photography tools.','ai-access'],
'Album & Event / Invite':['Album & Event / Invite','Manage albums, events and invitations from one place.','album-tools'],
'WhatsApp Credits':['WhatsApp Credits','Review messaging credits and sharing options.','whatsapp'],
'Billing':['Billing','Create an invoice and track customer payments.','billing'],
'My Website':['My Website','Manage your studio website and public links.','website'],
'Gallery Banner':['Gallery Banner','Prepare a branded cover banner for your gallery.','gallery-banner'],
'My Profile':['My Profile','Update your studio profile information.','profile'],
'Help Center':['Help Center','Find guidance for using the dashboard.','help'],
'Support Tickets':['Support Tickets','Create a support request and review its status.','support']};
function restoreDashboard(){document.querySelector('.dynamic-view')?.remove();originalDashboard.forEach(el=>el.style.display='');document.querySelectorAll('.nav').forEach(n=>n.classList.remove('active'));document.querySelector('.nav[href="#dashboard"]')?.classList.add('active');}
function makePage(title,description,slug){
 originalDashboard.forEach(el=>el.style.display='none');document.querySelector('.dynamic-view')?.remove();
 const page=document.createElement('section');page.className='dynamic-view';
 page.innerHTML=`<div class="page-heading"><div><div class="page-eyebrow">MAHAKAL CSC CENTER · WORKSPACE</div><h1>${title}</h1><p>${description}</p></div><span class="page-chip">DEMO WORKSPACE</span></div>
 <div class="module-grid"><div class="module-card wide-card"><div class="module-icon">✦</div><h2>${title} workspace</h2><p>This menu opens its own screen. Live data and saving to an account require a connected backend.</p><div class="module-actions"><button class="module-primary" data-action="create">＋ Create new</button><button class="module-secondary" data-action="refresh">↻ Refresh</button></div></div>
 <div class="module-card"><h3>Quick summary</h3><div class="summary-line"><span>Workspace status</span><b class="label-ready">Ready</b></div><div class="summary-line"><span>Live account connection</span><b>Not connected</b></div><div class="summary-line"><span>Saved records</span><b class="record-count">0</b></div></div>
 <div class="module-card form-card"><h3>Quick details</h3><label>Title / name<input class="module-input" id="moduleName" placeholder="Enter a name"></label><label>Notes<textarea class="module-input" id="moduleNotes" placeholder="Add notes for this item"></textarea></label><button class="module-primary" data-action="save">Save demo item</button><p class="module-result" aria-live="polite"></p></div>
 <div class="module-card"><h3>Recent items</h3><div class="empty-module"><span>▤</span><b>No items yet</b><small>Create a demo item to see it here.</small></div><div class="created-items"></div></div></div>`;
 main.appendChild(page);
 page.querySelectorAll('[data-action]').forEach(btn=>btn.addEventListener('click',()=>{
 const action=btn.dataset.action,result=page.querySelector('.module-result');
 if(action==='create'){page.querySelector('#moduleName').focus();notify('Enter details in the Quick details form.');}
 if(action==='refresh')notify('This demo screen is refreshed.');
 if(action==='save'){const name=page.querySelector('#moduleName').value.trim(),notes=page.querySelector('#moduleNotes').value.trim();if(!name){result.textContent='Please enter a title / name first.';page.querySelector('#moduleName').focus();return;}
 const item=document.createElement('div');item.className='saved-item';const b=document.createElement('b'),s=document.createElement('small');b.textContent=name;s.textContent=notes||'Demo item saved in this open page only.';item.append(b,s);page.querySelector('.created-items').prepend(item);page.querySelector('.empty-module').style.display='none';page.querySelector('.record-count').textContent=page.querySelectorAll('.saved-item').length;result.textContent='Demo item added. It is not saved to a server.';page.querySelector('#moduleName').value='';page.querySelector('#moduleNotes').value='';}
 }));
}
document.querySelectorAll('.nav').forEach(link=>link.addEventListener('click',event=>{event.preventDefault();document.querySelectorAll('.nav').forEach(n=>n.classList.remove('active'));link.classList.add('active');const label=link.querySelector('span')?.textContent?.trim()||'Dashboard';if(label==='Dashboard'){restoreDashboard();history.replaceState(null,'','#dashboard');return;}const info=pageInfo[label];if(info){makePage(...info);history.replaceState(null,'','#'+info[2]);}}));
document.querySelectorAll('[data-msg]').forEach(b=>b.addEventListener('click',()=>notify(b.dataset.msg)));
document.getElementById('trialBtn')?.addEventListener('click',()=>notify('Free trial action: connect your signup link here.'));
document.getElementById('logout')?.addEventListener('click',()=>notify('Demo dashboard: login is not connected.'));
document.getElementById('viewAll')?.addEventListener('click',()=>notify('Showing the latest demo events.'));
document.getElementById('activityBtn')?.addEventListener('click',()=>notify('Showing the latest demo client activity.'));
