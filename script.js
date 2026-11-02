import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js';
import { getFirestore, collection, getDocs, addDoc, query, orderBy, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js';
import { firebaseConfig } from './firebase-config.js';

const $ = (id) => document.getElementById(id);
const grid = $('galleryGrid');
let db = null;
let photos = [];
const selected = new Set();
const configured = firebaseConfig.apiKey && !firebaseConfig.apiKey.startsWith('PASTE_') && firebaseConfig.projectId !== 'YOUR_PROJECT_ID';

function setStatus(message, good=false){ $('galleryStatus').textContent=message; $('galleryStatus').style.background=good?'#e6f7ef':'#fff5df'; $('galleryStatus').style.color=good?'#167a55':'#76500b'; }
function renderGallery(items){
  grid.replaceChildren();
  if(!items.length){ const e=document.createElement('div');e.className='empty';e.textContent='હજુ ગેલેરીમાં ફોટા ઉમેર્યા નથી. / No gallery photos found. Add photo documents in Firestore collection: gallery';grid.append(e);return; }
  items.forEach(photo=>{
    const card=document.createElement('label'); card.className='photo-card'+(selected.has(photo.id)?' selected':'');
    const img=document.createElement('img');img.src=photo.url;img.alt=photo.title||'Gallery photo';img.loading='lazy';
    const check=document.createElement('input');check.type='checkbox';check.checked=selected.has(photo.id);check.setAttribute('aria-label','Select '+(photo.title||'photo'));
    check.addEventListener('change',()=>{if(check.checked)selected.add(photo.id);else selected.delete(photo.id);card.classList.toggle('selected',check.checked);$('selectedCount').textContent=selected.size;});
    const title=document.createElement('div');title.className='photo-title';title.textContent=photo.title||'Photo';
    card.append(check,img,title);grid.append(card);
  });
}
async function loadGallery(){
  try{const snap=await getDocs(query(collection(db,'gallery'),orderBy('createdAt','desc')));photos=snap.docs.map(d=>({id:d.id,...d.data()})).filter(p=>typeof p.url==='string'&&/^https:\/\//.test(p.url));renderGallery(photos);setStatus('Firebase connected • '+photos.length+' photos',true);}
  catch(err){console.error(err);setStatus('Firebase rules/config તપાસો / Check setup');grid.innerHTML='<div class="empty">ગેલેરી લોડ થઈ નથી. Firebase config, Firestore અને security rules તપાસો. / Gallery could not load. Check Firebase config, Firestore and rules.</div>';}
}
if(configured){try{const app=initializeApp(firebaseConfig);db=getFirestore(app);loadGallery();}catch(e){console.error(e);setStatus('Firebase initialization failed');grid.innerHTML='<div class="empty">Firebase શરૂ થઈ શક્યું નથી. firebase-config.js તપાસો.</div>';}}
else{setStatus('Setup required • Firebase config missing');grid.innerHTML='<div class="empty">સેટઅપ બાકી છે: firebase-config.example.js ને firebase-config.js નામે copy કરીને Firebase Web App config ઉમેરો. / Setup required: copy firebase-config.example.js to firebase-config.js and add your Firebase Web App config.</div>';}

$('selectionForm').addEventListener('submit',async(e)=>{
  e.preventDefault();const msg=$('selectionMessage');msg.className='message';
  if(!db){msg.textContent='Firebase સેટઅપ પહેલાં પૂર્ણ કરો. / Complete Firebase setup first.';msg.classList.add('error');return;}
  if(!selected.size){msg.textContent='કૃપા કરીને ઓછામાં ઓછો એક ફોટો પસંદ કરો. / Select at least one photo.';msg.classList.add('error');return;}
  const name=$('customerName').value.trim(),phone=$('customerPhone').value.trim();
  if(!name||!phone){msg.textContent='નામ અને મોબાઇલ નંબર જરૂરી છે. / Name and mobile are required.';msg.classList.add('error');return;}
  const chosen=photos.filter(p=>selected.has(p.id)).map(p=>({photoId:p.id,title:String(p.title||'Photo').slice(0,150),url:p.url}));
  try{await addDoc(collection(db,'selections'),{customerName:name,customerPhone:phone,customerNote:$('customerNote').value.trim().slice(0,500),photos:chosen,status:'new',createdAt:serverTimestamp()});msg.textContent='પસંદગી સફળતાપૂર્વક મોકલાઈ! / Selection sent successfully.';msg.classList.add('success');selected.clear();$('selectedCount').textContent='0';$('selectionForm').reset();renderGallery(photos);}
  catch(err){console.error(err);msg.textContent='મોકલી શકાયું નથી. Firestore rules અને project setup તપાસો. / Could not submit. Check Firestore rules and project setup.';msg.classList.add('error');}
});

// Bilingual printable invoice (not stored in Firebase in this starter).
function addBillRow(service='',qty=1,rate=0){const tr=document.createElement('tr');tr.innerHTML='<td><input class="row-service" maxlength="120" placeholder="સેવાનું નામ / Service" value=""></td><td><input class="qty" type="number" min="0" step="1" value="1"></td><td><input class="rate" type="number" min="0" step="0.01" value="0"></td><td class="amount">₹0.00</td><td class="no-print"><button class="remove-row" type="button">Remove / કાઢો</button></td>';tr.querySelector('.row-service').value=service;tr.querySelector('.qty').value=qty;tr.querySelector('.rate').value=rate;tr.querySelectorAll('input').forEach(i=>i.addEventListener('input',recalc));tr.querySelector('.remove-row').addEventListener('click',()=>{tr.remove();recalc();});$('billRows').append(tr);recalc();}
function money(n){return '₹'+Number(n||0).toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2});}
function recalc(){let subtotal=0;[...$('billRows').rows].forEach(r=>{const a=Math.max(0,Number(r.querySelector('.qty').value)||0)*Math.max(0,Number(r.querySelector('.rate').value)||0);subtotal+=a;r.querySelector('.amount').textContent=money(a);});const discount=Math.max(0,Number($('discount').value)||0);$('subtotal').textContent=money(subtotal);$('grandTotal').textContent=money(Math.max(0,subtotal-discount));}
$('addRow').addEventListener('click',()=>addBillRow());$('discount').addEventListener('input',recalc);$('printInvoice').addEventListener('click',()=>window.print());
$('invoiceDate').value=new Date().toISOString().slice(0,10);$('invoiceNo').value='INV-'+new Date().toISOString().slice(0,10).replaceAll('-','')+'-001';$('year').textContent=new Date().getFullYear();addBillRow();
