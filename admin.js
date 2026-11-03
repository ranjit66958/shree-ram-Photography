import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
  getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut,
  sendEmailVerification, sendPasswordResetEmail, reload
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import {
  getFirestore, collection, addDoc, getDocs, query, orderBy,
  serverTimestamp, deleteDoc, doc
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import {
  getStorage, ref, uploadBytes, getDownloadURL, deleteObject
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-storage.js";
import { firebaseConfig } from "./firebase-config.js";

// IMPORTANT: આ ઈમેઇલને firestore.rules અને storage.rulesમાં પણ એ જ રાખવો.
const ADMIN_EMAIL = "YOUR_ADMIN_EMAIL";
const $ = (id) => document.getElementById(id);
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

function message(id, text, type="") {
  const el = $(id); el.textContent = text; el.className = "message " + type;
}
function show(id, yes) { $(id).classList.toggle("hidden", !yes); }
function isAllowed(user) {
  return !!user && user.emailVerified &&
    (user.email || "").toLowerCase() === ADMIN_EMAIL.toLowerCase();
}
function showLogin() {
  show("loginPanel", true); show("verifyPanel", false); show("adminPanel", false);
}
function showVerify(user) {
  show("loginPanel", false); show("verifyPanel", true); show("adminPanel", false);
  $("verifyText").textContent = `ઈમેઇલ ${user.email} વેરિફાય કરો, પછી ફરી Login કરો.`;
}
function showAdmin(user) {
  show("loginPanel", false); show("verifyPanel", false); show("adminPanel", true);
  $("signedInAs").textContent = user.email;
  loadGallery(); loadSelections();
}
function errorText(err) {
  const map = {
    "auth/invalid-credential": "ઈમેઇલ અથવા પાસવર્ડ ખોટો છે.",
    "auth/too-many-requests": "ઘણા પ્રયાસ થયા છે. થોડા સમય પછી ફરી પ્રયાસ કરો.",
    "auth/network-request-failed": "ઈન્ટરનેટ કનેક્શન તપાસો.",
    "permission-denied": "પરવાનગી નકારી. Firestore/Storage Rules અને Admin ઈમેઇલ તપાસો."
  };
  return map[err.code] || `${err.message || "અજાણી ભૂલ"} (${err.code || "error"})`;
}

$("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = $("email").value.trim().toLowerCase();
  if (ADMIN_EMAIL === "YOUR_ADMIN_EMAIL" || !ADMIN_EMAIL.includes("@")) {
    message("loginMessage", "પહેલા admin.js, firestore.rules અને storage.rulesમાં YOUR_ADMIN_EMAIL બદલો.", "error"); return;
  }
  if (email !== ADMIN_EMAIL.toLowerCase()) {
    message("loginMessage", "આ ઈમેઇલને Admin પરવાનગી નથી.", "error"); return;
  }
  try {
    message("loginMessage", "Login થઈ રહ્યું છે…");
    await signInWithEmailAndPassword(auth, email, $("password").value);
  } catch (err) { message("loginMessage", errorText(err), "error"); }
});
$("resetPassword").addEventListener("click", async () => {
  const email = $("email").value.trim().toLowerCase();
  if (!email) { message("loginMessage", "પહેલા Admin ઈમેઇલ લખો.", "error"); return; }
  try { await sendPasswordResetEmail(auth, email); message("loginMessage", "જો આ ઈમેઇલ નોંધાયેલો હોય તો પાસવર્ડ રીસેટ લિંક મોકલાઈ છે.", "success"); }
  catch (err) { message("loginMessage", errorText(err), "error"); }
});
$("sendVerification").addEventListener("click", async () => {
  try { if (auth.currentUser) await sendEmailVerification(auth.currentUser); message("verifyMessage", "વેરિફિકેશન ઈમેઇલ મોકલાયો. Inbox/Spam તપાસો.", "success"); }
  catch (err) { message("verifyMessage", errorText(err), "error"); }
});
$("verifySignOut").addEventListener("click", () => signOut(auth));
$("logout").addEventListener("click", () => signOut(auth));

onAuthStateChanged(auth, async (user) => {
  if (!user) { showLogin(); return; }
  try { await reload(user); } catch {}
  if ((user.email || "").toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
    await signOut(auth); showLogin(); message("loginMessage", "આ ઈમેઇલને Admin પરવાનગી નથી.", "error"); return;
  }
  if (!user.emailVerified) { showVerify(user); return; }
  showAdmin(user);
});

$("uploadForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const user = auth.currentUser;
  if (!isAllowed(user)) { message("uploadMessage", "ફોટો અપલોડ કરવા Admin login અને verified ઈમેઇલ જરૂરી છે.", "error"); return; }
  const file = $("photoFile").files[0];
  const title = $("photoTitle").value.trim();
  if (!file || !title) { message("uploadMessage", "ફોટાનું નામ અને ફાઇલ પસંદ કરો.", "error"); return; }
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) { message("uploadMessage", "માત્ર JPG, PNG અથવા WebP ફાઇલ માન્ય છે.", "error"); return; }
  if (file.size > 15 * 1024 * 1024) { message("uploadMessage", "ફાઇલ 15 MBથી નાની હોવી જોઈએ.", "error"); return; }
  const btn = $("uploadButton"); btn.disabled = true;
  let objectRef;
  try {
    message("uploadMessage", "ફોટો અપલોડ થઈ રહ્યો છે…");
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-100);
    const path = `gallery/${Date.now()}_${crypto.randomUUID()}_${safeName}`;
    objectRef = ref(storage, path);
    await uploadBytes(objectRef, file, { contentType: file.type });
    const url = await getDownloadURL(objectRef);
    await addDoc(collection(db, "gallery"), { title: title.slice(0,150), url, storagePath: path, createdAt: serverTimestamp() });
    $("uploadForm").reset();
    message("uploadMessage", "ફોટો સફળતાપૂર્વક ઉમેરાયો.", "success");
    await loadGallery();
  } catch (err) {
    console.error(err);
    // If Firestore document creation failed after storage upload, remove the orphaned file.
    if (objectRef) { try { await deleteObject(objectRef); } catch {} }
    message("uploadMessage", errorText(err), "error");
  } finally { btn.disabled = false; }
});

async function loadGallery() {
  const root = $("adminGallery"); root.replaceChildren();
  try {
    const snap = await getDocs(query(collection(db, "gallery"), orderBy("createdAt", "desc")));
    if (snap.empty) { root.innerHTML = '<div class="empty">હજુ કોઈ ફોટો ઉમેર્યો નથી.</div>'; return; }
    for (const d of snap.docs) {
      const p = d.data();
      const card = document.createElement("article"); card.className = "photo";
      const img = document.createElement("img"); img.src = p.url || ""; img.alt = p.title || "Photo"; img.loading = "lazy";
      const meta = document.createElement("div"); meta.className = "meta";
      const title = document.createElement("div"); title.className = "title"; title.textContent = p.title || "Photo";
      const del = document.createElement("button"); del.className = "delete"; del.type = "button"; del.textContent = "ફોટો કાઢો";
      del.addEventListener("click", async () => {
        if (!confirm(`"${p.title || "Photo"}" કાઢવો છે?`)) return;
        del.disabled = true;
        try {
          await deleteDoc(doc(db, "gallery", d.id));
          if (p.storagePath) { try { await deleteObject(ref(storage, p.storagePath)); } catch (err) { console.warn("Storage delete failed", err); } }
          await loadGallery();
        } catch (err) { alert(errorText(err)); del.disabled = false; }
      });
      meta.append(title, del); card.append(img, meta); root.append(card);
    }
  } catch (err) { console.error(err); root.innerHTML = `<div class="empty">${escapeHtml(errorText(err))}</div>`; }
}
async function loadSelections() {
  const root = $("selectionsList"); root.replaceChildren();
  try {
    const snap = await getDocs(query(collection(db, "selections"), orderBy("createdAt", "desc")));
    if (snap.empty) { root.innerHTML = '<div class="empty">હજુ કોઈ ગ્રાહક પસંદગી મળી નથી.</div>'; return; }
    snap.forEach(d => {
      const s = d.data();
      const card = document.createElement("article"); card.className = "selection";
      const h = document.createElement("h3"); h.textContent = s.customerName || "ગ્રાહક";
      const detail = document.createElement("p");
      detail.textContent = `મોબાઇલ: ${s.customerPhone || "-"} • સ્થિતિ: ${s.status || "-"} • ${s.customerNote || "નોંધ નથી"}`;
      const photos = document.createElement("div"); photos.className = "selection-photos";
      (Array.isArray(s.photos) ? s.photos : []).forEach(photo => {
        const img = document.createElement("img"); img.src = photo.url || ""; img.alt = photo.title || "Selected photo"; img.loading = "lazy"; photos.append(img);
      });
      card.append(h, detail, photos); root.append(card);
    });
  } catch (err) { console.error(err); root.innerHTML = `<div class="empty">${escapeHtml(errorText(err))}</div>`; }
}
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]));
}
$("refreshGallery").addEventListener("click", loadGallery);
$("refreshSelections").addEventListener("click", loadSelections);
