import { auth, db } from "./firebaseconfig.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

const modifier = document.getElementById("modifier");

modifier.addEventListener("click", () => {
  location.href = "modifier-compte.html";
});

onAuthStateChanged(auth, async (user) => {
  if (user) {
    const uid = user.uid;
    const userDocRef = doc(db, "utilisateurs", uid);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      const data = userDocSnap.data();

      // Photo de profil
      document.getElementById('pdp').src = data.photoProfil || 'default.jpg';

      // Données
      document.getElementById('prenom').textContent = data.prenom || '';
      document.getElementById('nom').textContent = data.nom || '';
      document.getElementById('age').textContent = data.age || '';
      document.getElementById('ville').textContent = data.ville || '';
      document.getElementById('vaecole').textContent = data.vaALecole || '';
      document.getElementById('ecole').textContent = data.ecole || '';
      document.getElementById('niveau').textContent = data.niveau || '';
      document.getElementById('ambition').textContent = data.ambition || '';
      document.getElementById('objectif').textContent = (data.objectifs || []).join(', ');
      document.getElementById('tempslibre').textContent = data.tempslibre || '';
      document.getElementById('parletoi').textContent = data.parletoi || '';
      document.getElementById('raison').textContent = data.raison || '';
      document.getElementById('competence').textContent = data.competence || '';

      // Réseaux sociaux
      const reseauxDiv = document.getElementById('reseaux');
      reseauxDiv.innerHTML = "";

      const logos = {
        instagram: 'img/logo-insta.jpg',
        tiktok: 'img/logo-tiktok.png',
        snapchat: 'img/logo-snap.jpg'
      };

      if (data.reseaux) {
        for (const [nom, lien] of Object.entries(data.reseaux)) {
          if (lien) {
            const label = document.createElement('label');
            label.className = 'social-label';

            const img = document.createElement('img');
            img.src = logos[nom] || '';
            img.alt = `logo ${nom}`;
            img.className = 'logo-reseau';

            const a = document.createElement('a');
            a.href = lien;
            a.target = "_blank";
            a.textContent = nom.charAt(0).toUpperCase() + nom.slice(1);

            label.appendChild(img);
            label.appendChild(a);
            reseauxDiv.appendChild(label);
          }
        }
      } else {
        reseauxDiv.textContent = "Aucun réseau social renseigné.";
      }

    } else {
      alert("Aucune donnée trouvée.");
    }

  } else {
    window.location.href = "connexion.html";
  }
});

// ✅ Déconnexion
document.getElementById('btn-logout').addEventListener('click', () => {
  signOut(auth)
    .then(() => {
      window.location.href = "connexion.html";
    })
    .catch((error) => {
      console.error("Erreur de déconnexion :", error);
    });
});
