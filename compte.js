import { auth, db } from "./firebaseconfig.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

const modifierBtn = document.getElementById("modifier");
const logoutBtn = document.getElementById("btn-logout");

modifierBtn.addEventListener("click", () => {
  window.location.href = "modifier-compte.html";
});

logoutBtn.addEventListener("click", () => {
  signOut(auth)
    .then(() => {
      window.location.href = "connexion.html";
    })
    .catch((error) => {
      console.error("Erreur de déconnexion :", error);
      alert("Erreur lors de la déconnexion");
    });
});

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "connexion.html";
    return;
  }

  try {
    const userDoc = await getDoc(doc(db, "utilisateurs", user.uid));
    if (!userDoc.exists()) {
      alert("Aucune donnée trouvée pour cet utilisateur.");
      return;
    }

    const data = userDoc.data();

    const pdp = document.getElementById('pdp');

    // Affichage de la photo (base64 ou URL)
    if (data.photoUrl && data.photoUrl.trim() !== '') {
      pdp.src = data.photoUrl;
    } else {
      pdp.src = 'img/default.jpg';
    }
    pdp.style.display = 'block';

    document.getElementById('prenom').textContent = data.prenom || '';
    document.getElementById('nom').textContent = data.nom || '';
    document.getElementById('age').textContent = data.age || '';
    document.getElementById('ville').textContent = data.ville || '';
    document.getElementById('vaecole').textContent = data.vaALecole || '';
    document.getElementById('ecole').textContent = data.ecole || '';
    document.getElementById('niveau').textContent = data.niveau || '';
    document.getElementById('ambition').textContent = data.ambition || '';
    document.getElementById('objectif').textContent = (data.objectifs || []).join(", ");
    document.getElementById('tempslibre').textContent = data.tempslibre || '';
    document.getElementById('parletoi').textContent = data.parletoi || '';
    document.getElementById('raison').textContent = data.raison || '';
    document.getElementById('competence').textContent = data.competence || '';

    // Réseaux sociaux
    const reseauxDiv = document.getElementById('reseaux');
    reseauxDiv.innerHTML = "";

    const logos = {
      instagram: 'logo-insta.jpg',
      tiktok: 'logo-tiktok.png',
      snapchat: 'logo-snap.jpg'
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
  } catch (error) {
    console.error("Erreur récupération données :", error);
    alert("Erreur lors de la récupération des données.");
  }
});
