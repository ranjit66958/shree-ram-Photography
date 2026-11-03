# Shree Ram Photography — Firebase Admin Panel

આ પેકેજમાં `admin.html`, `admin.css`, `admin.js`, `firestore.rules` અને `storage.rules` છે. તમારી હાલની `index.html`, `style.css`, `script.js` અને `firebase-config.js` ફાઇલોને બદલેવાની જરૂર નથી.

## 1. સૌથી પહેલાં Firebase config તપાસો

તમારી હાલની `firebase-config.js` ફાઇલમાં જો `તમારી_API_KEY`, `તમારું_STORAGE_BUCKET` અથવા `તમારો_APP_ID` જેવા placeholder હોય તો તેને Firebase Consoleના સાચા મૂલ્યોથી બદલો.

Firebase Console → Project settings (gear icon) → General → Your apps → Web app → SDK setup and configuration. `projectId`, `authDomain`, `storageBucket`, `messagingSenderId`, `appId` એ જ Firebase projectનાં હોવા જોઈએ. `firebase-config.js`માં `export const firebaseConfig = { ... }` ફોર્મેટ જ રાખો.

> Firebase Web API key વેબ એપમાં દેખાય તે સામાન્ય છે; તેને password ન માનો. સુરક્ષા Authentication અને Rulesથી લાગુ થાય છે. Service-account/private key ક્યારેય GitHubમાં ન મૂકો.

## 2. Admin email එකસરખો રાખો

આ ત્રણ જગ્યાએ `YOUR_ADMIN_EMAIL` બદલો:
- `admin.js`માં `const ADMIN_EMAIL = "YOUR_ADMIN_EMAIL";`
- `firestore.rules`માં `request.auth.token.email == 'YOUR_ADMIN_EMAIL'`
- `storage.rules`માં `request.auth.token.email == 'YOUR_ADMIN_EMAIL'`

ત્રણેયમાં એ જ ઈમેઇલ લખવો. ઈમેઇલની આસપાસના quotes કાઢશો નહીં.

## 3. Firebase Authentication

1. Firebase Console → Authentication → Sign-in method.
2. Email/Password provider Enabled હોવો જોઈએ.
3. Authentication → Users → Add user દ્વારા Admin ઈમેઇલ અને મજબૂત password બનાવો.
4. Admin login કર્યા પછી verification email મોકલીને ઈમેઇલ verify કરો. Admin panel verified email જ સ્વીકારે છે.
5. Authentication → Settings → Authorized domainsમાં તમારી GitHub Pages host `ranjit66958.github.io` હોસ્ટને ઉમેરો જો તે પહેલેથી ન હોય. સામાન્ય રીતે Firebase Consoleમાં domain ફક્ત `ranjit66958.github.io` લખાય છે, સંપૂર્ણ URL નહીં.

## 4. Firestore Rules publish કરો

Firebase Console → Firestore Database → Rules. હાલના Rulesનો બેકઅપ લો, પછી `firestore.rules`ની સામગ્રી પેસ્ટ કરીને `YOUR_ADMIN_EMAIL` બદલો અને Publish કરો.

આ Rules:
- જાહેર વેબસાઇટને `gallery` ફોટા વાંચવા દે છે.
- ફક્ત verified Adminને gallery manage કરવા દે છે.
- ગ્રાહકોને `selections` submit કરવા દે છે, પણ વાંચવા ફક્ત Adminને દે છે.
- `customers` collectionને ફક્ત Admin સુધી મર્યાદિત કરે છે.

## 5. Firebase Storage ચાલુ કરો અને Rules publish કરો

Firebase Console → Storage → Get started. જો Storage bucket હજી બનાવ્યું ન હોય તો wizard પૂર્ણ કરો. પછી Storage → Rulesમાં `storage.rules`ની સામગ્રી પેસ્ટ કરો, Admin email બદલો અને Publish કરો.

Storage Rules ફક્ત `gallery/` pathમાં JPG/PNG/WebP અને 15 MBથી નાની ફાઇલને મંજૂરી આપે છે. જો Firebase projectમાં Storage સેટઅપ/બિલિંગની શરતો દેખાય, તો Consoleમાં દર્શાવેલી હાલની શરતો તપાસો.

## 6. GitHub પર અપલોડ

1. ખોલો: https://github.com/ranjit66958/shree-ram-Photography
2. Add file → Upload files પસંદ કરો.
3. આ પેકેજમાંથી `admin.html`, `admin.css`, `admin.js` root folderમાં upload કરો. તમારી હાલની ત્રણ website files replace કરવાની જરૂર નથી.
4. `firebase-config.js` સાચા config સાથે તૈયાર હોય તેની ખાતરી કરો. જો તેમાં placeholders હોય તો GitHubમાં તે ફાઇલ ખોલો → pencil icon → edit → Commit changes.
5. `firestore.rules` અને `storage.rules` GitHubમાં રાખી શકો છો, પરંતુ માત્ર GitHubમાં અપલોડ કરવાથી Firebase Rules publish થતા નથી. તે Firebase Consoleમાં અલગથી Publish કરવા જરૂરી છે.
6. GitHub Pages deploy થવા 1–5 મિનિટ રાહ જુઓ.

Admin પેજ: `https://ranjit66958.github.io/shree-ram-Photography/admin.html`

## 7. ટેસ્ટ

1. Admin પેજ ખોલો અને Admin ઈમેઇલથી login કરો.
2. Email verification જરૂરી હોય તો ઈમેઇલ verify કરો અને ફરી login કરો.
3. એક નાનો JPG/PNG/WebP ફોટો અપલોડ કરો.
4. જાહેર વેબસાઇટ `https://ranjit66958.github.io/shree-ram-Photography/` ખોલો અને Galleryમાં ફોટો દેખાય છે તેની ખાતરી કરો.
5. ગ્રાહકની પસંદગી મોકલીને Admin Panelમાં દેખાય છે કે નહીં તપાસો.

## નોંધ

- Admin પેજનું છુપાવવું સુરક્ષા નથી; Firebase Rules જ વાસ્તવિક સુરક્ષા આપે છે.
- `gallery`ના જૂના documentsમાં `storagePath` ન હોય તો ફોટો Firestoreમાંથી કાઢી શકાશે, પરંતુ Storageની જૂની ફાઇલ આપમેળે delete ન પણ થાય.
- હાલના `script.js`માં `gallery` collectionના `createdAt` પ્રમાણે sorting છે; નવા અપલોડમાં `createdAt` સાચવાય છે.
- જાહેર customer formમાં spam અટકાવવા production પહેલાં Firebase App Check / abuse protection ઉમેરવાનું વિચારો.
