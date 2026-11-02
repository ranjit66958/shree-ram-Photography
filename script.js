const $ = (id) => document.getElementById(id);
const banner = $('banner');
const toast = $('toast');
let toastTimer;
function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
}
function updatePreview() {
  $('titlePreview').textContent = $('studioName').value.trim() || 'YOUR STUDIO';
  $('subtitlePreview').textContent = $('subtitle').value.trim() || 'A collection of beautiful memories';
  $('eventLabel').textContent = $('eventType').value.toUpperCase() + ' COLLECTION';
  $('eventLabel').style.display = $('showLabel').checked ? 'inline-block' : 'none';
  const sizes = {
    wide: ['size-wide', '1920 × 700 px'],
    social: ['size-social', '1080 × 1080 px'],
    story: ['size-story', '1080 × 1920 px']
  };
  banner.classList.remove('size-wide','size-social','size-story');
  banner.classList.add(sizes[$('bannerSize').value][0]);
  $('dimensions').textContent = sizes[$('bannerSize').value][1];
}
['studioName','subtitle','eventType','bannerSize','showLabel'].forEach(id => {
  $(id).addEventListener('input', updatePreview);
  $(id).addEventListener('change', updatePreview);
});
document.querySelectorAll('.theme').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.theme').forEach(b => b.classList.remove('selected'));
    button.classList.add('selected');
    banner.classList.remove('theme-dark','theme-warm','theme-light');
    banner.classList.add('theme-' + button.dataset.theme);
  });
});
function loadImage(file, target, callback) {
  if (!file) return;
  if (!file.type.startsWith('image/')) { showToast('Please choose an image file.'); return; }
  const reader = new FileReader();
  reader.onload = e => { target.src = e.target.result; if (callback) callback(); };
  reader.readAsDataURL(file);
}
$('photoUpload').addEventListener('change', e => {
  const file = e.target.files[0];
  loadImage(file, banner, () => {
    banner.style.backgroundImage = `url("${banner.src}")`;
    banner.removeAttribute('src');
    showToast('Cover photo updated.');
  });
});
// Keep a separate background URL so theme and sizing changes do not replace the uploaded image.
let uploadedCover = '';
$('photoUpload').addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => { uploadedCover = ev.target.result; banner.style.backgroundImage = `url("${uploadedCover}")`; showToast('Cover photo updated.'); };
  reader.readAsDataURL(file);
});
$('logoUpload').addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => { $('logoPreview').src = ev.target.result; $('logoPreview').style.display = 'block'; showToast('Studio logo added.'); };
  reader.readAsDataURL(file);
});
$('resetBtn').addEventListener('click', () => {
  $('studioName').value = 'YOUR STUDIO';
  $('subtitle').value = 'A collection of beautiful memories';
  $('eventType').value = 'Wedding';
  $('bannerSize').value = 'wide';
  $('showLabel').checked = true;
  $('photoUpload').value = '';
  $('logoUpload').value = '';
  $('logoPreview').removeAttribute('src');
  $('logoPreview').style.display = 'none';
  uploadedCover = '';
  banner.style.backgroundImage = '';
  document.querySelectorAll('.theme').forEach(b => b.classList.toggle('selected', b.dataset.theme === 'dark'));
  banner.classList.remove('theme-warm','theme-light');
  banner.classList.add('theme-dark');
  updatePreview();
  showToast('Settings reset.');
});
$('downloadBtn').addEventListener('click', async () => {
  // Render the current banner as a downloadable SVG; external cover images may be blocked by browser CORS.
  const title = $('titlePreview').textContent;
  const subtitle = $('subtitlePreview').textContent;
  const event = $('eventLabel').textContent;
  const w = $('bannerSize').value === 'social' ? 1080 : $('bannerSize').value === 'story' ? 1080 : 1920;
  const h = $('bannerSize').value === 'social' ? 1080 : $('bannerSize').value === 'story' ? 1920 : 700;
  const bg = uploadedCover || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1800&q=85';
  const safe = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><defs><linearGradient id="shade"><stop stop-color="#111624" stop-opacity=".78"/><stop offset=".5" stop-color="#14131a" stop-opacity=".35"/><stop offset="1" stop-color="#101523" stop-opacity=".78"/></linearGradient></defs><image href="${bg}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid slice"/><rect width="100%" height="100%" fill="url(#shade)"/><g text-anchor="middle" fill="#fff"><text x="${w/2}" y="${h*.34}" font-family="Georgia,serif" font-size="${Math.min(w,h)*.025}" letter-spacing="7" fill="#e7d2a4">${safe(event)}</text><text x="${w/2}" y="${h*.49}" font-family="Georgia,serif" font-size="${Math.min(w,h)*.075}" letter-spacing="4">${safe(title)}</text><path d="M ${w*.46} ${h*.55} H ${w*.54}" stroke="#d7b77b" stroke-width="2"/><text x="${w/2}" y="${h*.63}" font-family="Georgia,serif" font-style="italic" font-size="${Math.min(w,h)*.028}">${safe(subtitle)}</text><text x="${w/2}" y="${h*.73}" font-family="Arial,sans-serif" font-size="${Math.min(w,h)*.012}" letter-spacing="4" fill="#e8d8bd">MEMORIES THAT LAST FOREVER</text></g></svg>`;
  const blob = new Blob([svg], {type:'image/svg+xml;charset=utf-8'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'gallery-banner.svg'; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  showToast('Banner downloaded as SVG. Open it in a browser or design app.');
});
$('helpBtn').addEventListener('click', () => showToast('Tip: upload a cover photo, edit the title, then download your banner.'));
updatePreview();