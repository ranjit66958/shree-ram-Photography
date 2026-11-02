const toast = document.getElementById('toast');
let timer;
function notify(message){toast.textContent=message;toast.classList.add('show');clearTimeout(timer);timer=setTimeout(()=>toast.classList.remove('show'),2600);}
document.querySelectorAll('[data-msg]').forEach(button=>button.addEventListener('click',()=>notify(button.dataset.msg)));
document.getElementById('trialBtn').addEventListener('click',()=>notify('Free trial action: connect your own signup link here.'));
document.getElementById('logout').addEventListener('click',()=>notify('Demo dashboard: login is not connected.'));
document.getElementById('viewAll').addEventListener('click',()=>notify('Showing the latest demo events.'));
document.getElementById('activityBtn').addEventListener('click',()=>notify('Showing the latest demo client activity.'));
document.querySelectorAll('.nav').forEach(link=>link.addEventListener('click',()=>{
 document.querySelectorAll('.nav').forEach(item=>item.classList.remove('active'));
 link.classList.add('active');
 if(link.getAttribute('href')!=='#dashboard') notify(link.querySelector('span')?.textContent+' section selected (demo).');
}));
