# મહાકાલ CSC સેન્ટર — Firebase સેટઅપ (Gujarati + English)

આ પેકેજમાં ગ્રાહક ગેલેરી, ફોટા પસંદ કરીને પસંદગી મોકલવાની સુવિધા અને Gujarati/English પ્રિન્ટ કરી શકાય એવું બિલ છે. Firebase project config નાખ્યા વગર ગેલેરી/સબમિશન કામ નહીં કરે. બિલનું હાલનું વર્ઝન બ્રાઉઝરમાં જ ચાલે છે; તે Firebaseમાં સાચવાતું નથી.

## 1. Firebase Project બનાવો
1. https://console.firebase.google.com/ ખોલો અને **Add project** દબાવો.
2. Project ID યાદ રાખો. Project બનાવ્યા પછી Project overview → **Web app (</>)** ઉમેરો.
3. Firebase આપશે તે `firebaseConfig` વિગતો કૉપી કરો.
4. `firebase-config.example.js` ની નકલ બનાવી તેનું નામ `firebase-config.js` રાખો. તેમાં API key, authDomain, projectId, storageBucket, messagingSenderId અને appId મૂકો. `PASTE_...` / `YOUR_PROJECT_ID` placeholders દૂર કરો.
5. `firebase-config.js` ને GitHub પર upload કરો. આ browser Web App config છે; **Service Account JSON / private key ક્યારેય અપલોડ કરશો નહીં**.

## 2. Firestore ચાલુ કરો
1. Firebase Console → Build → Firestore Database → Create database.
2. Rules વિભાગમાં આ ફોલ્ડરની `firestore.rules` ની સામગ્રી મૂકી Publish કરો.
3. Data વિભાગમાં `gallery` નામનું collection બનાવો. દરેક photo માટે document બનાવો, ઉદાહરણ:
   - `title` (string): `Wedding Photo 01`
   - `url` (string): `https://...` (ફોટાની HTTPS download URL)
   - `createdAt` (timestamp): હાલનો સમય
4. ગ્રાહક ફોટા પસંદ કરીને મોકલશે તો `selections` collectionમાં record બનશે. આ starter rules ગ્રાહકને selections વાંચવા દેતા નથી. Project owner Firebase Consoleમાં તે જોઈ શકે છે.

## 3. ફોટા ક્યાં મૂકવા?
આ સરળ starterમાં ફોટા Firebase Console → Storageમાં upload કરો. પછી ફોટાની HTTPS download URL `gallery` collectionના `url` fieldમાં મૂકો. `storage.rules` સુરક્ષિત default છે અને સીધા public upload/downloadની મંજૂરી આપતું નથી; જો Storage rules બદલો તો માત્ર યોગ્ય રીતે સુરક્ષિત published-photo access જ ખોલો. ખાનગી ગ્રાહક ફોટા public galleryમાં ન મૂકશો.

## 4. GitHub Pages પર અપલોડ
`index.html`, `style.css`, `script.js`, `firebase-config.js` અને આ rules/README ફાઇલો repositoryમાં મૂકી Commit changes કરો. વેબસાઇટ ખોલો અને Ctrl+F5 દબાવો. Browser Consoleમાં errors હોય તો તપાસો. GitHub Pages static hosting છે; Firebase backend અલગથી ચાલે છે.

## 5. બિલ
Billing વિભાગમાં સેવા, quantity, rate અને discount ભરો. **Print / PDF** દબાવી printer dialogમાં **Save as PDF** પસંદ કરો. આ વર્ઝન બિલને databaseમાં સાચવતું નથી. GST invoice, automatic invoice numbering, payment status, customer history અથવા server-side PDF જોઈએ તો તે અલગથી ઉમેરવું પડશે.

## સુરક્ષા નોંધ
- Public selection form પર spam થઈ શકે છે. વાસ્તવિક ઉપયોગ પહેલાં Firebase App Check, abuse/rate limiting અને યોગ્ય privacy notice ઉમેરો.
- Firebase Consoleમાં project owner access સુરક્ષિત રાખો; ગ્રાહકના ફોટા/મોબાઇલ નંબરને જાહેર repositoryમાં ન મૂકો.
- Rulesમાં ફેરફાર કરતા પહેલાં સમજવું જરૂરી છે. Admin gallery upload/edit માટે આ starter જાહેર write access આપતું નથી.
