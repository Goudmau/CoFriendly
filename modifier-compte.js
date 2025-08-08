// Initialisation Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "TON_API_KEY",
  authDomain: "TON_PROJECT.firebaseapp.com",
  projectId: "TON_PROJECT_ID",
  storageBucket: "TON_PROJECT.appspot.com",
  messagingSenderId: "TON_ID",
  appId: "TON_APP_ID"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const form = document.getElementById('profil-form');
const photoInput = document.getElementById('photo');
const preview = document.getElementById('photo-preview');
let photoBase64 = "";

// Fonction pour compresser l'image (max 800x800)
function resizeImage(file, maxWidth, maxHeight, callback) {
  const reader = new FileReader();
  reader.onload = function (event) {
    const img = new Image();
    img.onload = function () {
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height *= maxWidth / width;
        width = maxWidth;
      }
      if (height > maxHeight) {
        width *= maxHeight / height;
        height = maxHeight;
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob((blob) => {
        const reader2 = new FileReader();
        reader2.onload = () => callback(reader2.result); // base64 compressé
        reader2.readAsDataURL(blob);
      }, 'image/jpeg', 0.8);
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(file);
}

// Gestion du changement de photo
photoInput.addEventListener('change', () => {
  const file = photoInput.files[0];
  if (!file) return;

  resizeImage(file, 800, 800, (base64) => {
    photoBase64 = base64;
    preview.src = photoBase64;
    preview.style.display = 'block';
  });
});

// Remplir le formulaire avec les données existantes
async function remplirFormulaire(user) {
  const docRef = doc(db, "users", user.uid);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const data = docSnap.data();

    form.prenom.value = data.prenom || "";
    form.nom.value = data.nom || "";
    form.age.value = data.age || "";
    form.ecole.value = data.ecole || "";
    form.objectifs.value = data.objectifs || "";
    form.passions.value = data.passions || "";
    form.instagram.value = data.instagram ? data.instagram.replace("https://www.instagram.com/", "") : "";
    form.tiktok.value = data.tiktok ? data.tiktok.replace("https://www.tiktok.com/@", "") : "";
    form.snapchat.value = data.snapchat ? data.snapchat.replace("https://snapchat.com/add/", "") : "";

    if (data.photo) {
      preview.src = data.photo;
      preview.style.display = 'block';
      photoBase64 = data.photo;
    }
  }
}

// Soumission du formulaire
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const user = auth.currentUser;
  if (!user) return;

  const pseudoInstagram = form.instagram.value.trim();
  const pseudoTiktok = form.tiktok.value.trim();
  const pseudoSnap = form.snapchat.value.trim();

  const instagram = pseudoInstagram ? `https://www.instagram.com/${pseudoInstagram}` : '';
  const tiktok = pseudoTiktok ? `https://www.tiktok.com/@${pseudoTiktok}` : '';
  const snapchat = pseudoSnap ? `https://snapchat.com/add/${pseudoSnap}` : '';

  try {
    await setDoc(doc(db, "users", user.uid), {
      prenom: form.prenom.value.trim(),
      nom: form.nom.value.trim(),
      age: form.age.value.trim(),
      ecole: form.ecole.value.trim(),
      objectifs: form.objectifs.value.trim(),
      passions: form.passions.value.trim(),
      instagram,
      tiktok,
      snapchat,
      photo: photoBase64 || ""
    }, { merge: true });

    alert("✅ Profil enregistré avec succès !");
  } catch (error) {
    console.error("Erreur enregistrement :", error);
    alert("❌ Une erreur est survenue.");
  }
});

// Vérification de l'état de connexion
onAuthStateChanged(auth, (user) => {
  if (user) {
    remplirFormulaire(user);
  } else {
    window.location.href = "connexion.html";
  }
});
