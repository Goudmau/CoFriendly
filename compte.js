import { auth, db } from "./firebaseconfig.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const prenomSpan = document.getElementById('prenom');
const nomSpan = document.getElementById('nom');
const ageSpan = document.getElementById('age');
const villeSpan = document.getElementById('ville');
const vaecoleSpan = document.getElementById('vaecole');
const ecoleSpan = document.getElementById('ecole');
const niveauSpan = document.getElementById('niveau');
const ambitionSpan = document.getElementById('ambition');
const objectifsUl = document.getElementById('objectifs');
const passionsUl = document.getElementById('passions');
const tempslibreSpan = document.getElementById('tempslibre');
const parletoiSpan = document.getElementById('parletoi');
const raisonSpan = document.getElementById('raison');
const competenceSpan = document.getElementById('competence');
const pdpImg = document.getElementById('pdp');

const instagramLink = document.getElementById('instagram');
const tiktokLink = document.getElementById('tiktok');
const snapchatLink = document.getElementById('snapchat');

const btnModifier = document.getElementById('btn-modifier');
const btnLogout = document.getElementById('btn-logout');

onAuthStateChanged(auth, async (user) => {
  if (user) {
    const userRef = doc(db, 'utilisateurs', user.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const data = userSnap.data();

      prenomSpan.textContent = data.prenom || '';
      nomSpan.textContent = data.nom || '';
      ageSpan.textContent = data.age || '';
      villeSpan.textContent = data.ville || '';
      vaecoleSpan.textContent = data.vaALecole || '';
      ecoleSpan.textContent = data.ecole || '';
      niveauSpan.textContent = data.niveau || '';
      ambitionSpan.textContent = data.ambition || '';
      tempslibreSpan.textContent = data.tempslibre || '';
      parletoiSpan.textContent = data.parletoi || '';
      raisonSpan.textContent = data.raison || '';
      competenceSpan.textContent = data.competence || '';

      // Objectifs
      objectifsUl.innerHTML = '';
      if (Array.isArray(data.objectifs)) {
        data.objectifs.forEach(obj => {
          const li = document.createElement('li');
          li.textContent = obj;
          objectifsUl.appendChild(li);
        });
      }

      // Passions
      passionsUl.innerHTML = '';
      if (Array.isArray(data.passions)) {
        data.passions.forEach(pas => {
          const li = document.createElement('li');
          li.textContent = pas;
          passionsUl.appendChild(li);
        });
      }

      // Photo de profil
      if (data.photoUrl && data.photoUrl.trim() !== '') {
        pdpImg.src = data.photoUrl;
      } else {
        pdpImg.src = "default-avatar.png"; // avatar par défaut si tu veux
      }

      // Réseaux sociaux
      if (data.reseaux) {
        if (data.reseaux.instagram) {
          instagramLink.href = data.reseaux.instagram;
          instagramLink.style.display = "inline";
          instagramLink.textContent = "Instagram";
        } else {
          instagramLink.style.display = "none";
        }
        if (data.reseaux.tiktok) {
          tiktokLink.href = data.reseaux.tiktok;
          tiktokLink.style.display = "inline";
          tiktokLink.textContent = "TikTok";
        } else {
          tiktokLink.style.display = "none";
        }
        if (data.reseaux.snapchat) {
          snapchatLink.href = data.reseaux.snapchat;
          snapchatLink.style.display = "inline";
          snapchatLink.textContent = "Snapchat";
        } else {
          snapchatLink.style.display = "none";
        }
      }
    }
  } else {
    // Redirige si non connecté
    window.location.href = "connexion.html";
  }
});

btnModifier.addEventListener('click', () => {
  window.location.href = "modifier-compte.html";
});

btnLogout.addEventListener('click', async () => {
  try {
    await signOut(auth);
    window.location.href = "index.html";
  } catch (error) {
    alert("Erreur lors de la déconnexion : " + error.message);
  }
});
