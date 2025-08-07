import { auth, db } from './firebaseconfig.js';
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

// Récupération des éléments du DOM
const form = document.getElementById('form');
const message = document.getElementById('message');
const previewPdp = document.getElementById('preview-pdp');
const pdpInput = document.getElementById('pdp');

// Objectifs dynamiques
const objectifContainer = document.getElementById('objectif-container');
document.getElementById('add-objectif').addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Nouvel objectif';
    objectifContainer.appendChild(input);
});
document.getElementById('clear-objectif').addEventListener('click', () => {
    objectifContainer.innerHTML = '';
});

// Passions dynamiques
const passionContainer = document.getElementById('passion-container');
document.getElementById('add-passion').addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Nouvelle passion';
    passionContainer.appendChild(input);
});
document.getElementById('clear-passions').addEventListener('click', () => {
    passionContainer.innerHTML = '';
});

// Aperçu image de profil
pdpInput.addEventListener('change', () => {
    const file = pdpInput.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = e => {
            previewPdp.src = e.target.result;
            previewPdp.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
});

// Soumission du formulaire
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const user = auth.currentUser;
    if (!user) {
        message.textContent = "Erreur : utilisateur non connecté.";
        return;
    }

    // Récupérer les données du formulaire
    const prenom = document.getElementById('prenom').value.trim();
    const nom = document.getElementById('nom').value.trim();
    const age = parseInt(document.getElementById('age').value.trim());
    const ville = document.getElementById('ville').value.trim();
    const vaALecole = document.getElementById('ecole?').value;
    const ecole = document.getElementById('ecole').value.trim();
    const niveau = document.getElementById('niveau').value;
    const ambition = document.getElementById('ambition').value.trim();
    const tempslibre = document.getElementById('tempslibre').value.trim();
    const parletoi = document.getElementById('parletoi').value.trim();
    const raison = document.getElementById('raison').value.trim();
    const competence = document.getElementById('competence').value.trim();

    // Objectifs
    const objectifs = [];
    objectifContainer.querySelectorAll('input').forEach(input => {
        if (input.value.trim()) objectifs.push(input.value.trim());
    });

    // Passions
    const passions = [];
    passionContainer.querySelectorAll('input').forEach(input => {
        if (input.value.trim()) passions.push(input.value.trim());
    });

    // Réseaux sociaux
    const instagram = document.getElementById('instagram').value.trim();
    const tiktok = document.getElementById('tiktok').value.trim();
    const pseudoSnap = document.getElementById('snapchat').value.trim();
    const snapchat = pseudoSnap ? `https://snapchat.com/add/${pseudoSnap}` : '';

    // Aperçu image base64
    const pdpFile = pdpInput.files[0];
    let pdpBase64 = '';
    if (pdpFile) {
        const reader = new FileReader();
        reader.onloadend = async () => {
            pdpBase64 = reader.result;

            // Envoi à Firestore
            await saveToFirestore();
        };
        reader.readAsDataURL(pdpFile);
    } else {
        await saveToFirestore();
    }

    async function saveToFirestore() {
        try {
            const userRef = doc(db, 'utilisateurs', user.uid);
            await setDoc(userRef, {
                prenom,
                nom,
                age,
                ville,
                vaALecole,
                ecole,
                niveau,
                ambition,
                objectifs,
                passions,
                tempslibre,
                parletoi,
                raison,
                competence,
                reseaux: {
                    instagram,
                    tiktok,
                    snapchat
                },
                photoProfil: pdpBase64 || null,
                uid: user.uid
            });

            message.textContent = "Profil enregistré avec succès !";
            message.style.color = 'green';
            location.href = "compte.html";
        } catch (error) {
            console.error("Erreur lors de l’enregistrement :", error);
            message.textContent = "Erreur lors de l’enregistrement.";
            message.style.color = 'red';
        }
    }
    onAuthStateChanged(auth, async (user) => {
  if (user) {
    const userDocRef = doc(db, "users", user.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      const data = userDocSnap.data();

      // Tu mets les valeurs dans les champs du formulaire
      document.getElementById("prenom").value = data.prenom || "";
      document.getElementById("nom").value = data.nom || "";
      document.getElementById("age").value = data.age || "";
      document.getElementById("ecole").value = data.ecole || "";
      document.getElementById("passions").value = data.passions || "";
      document.getElementById("objectifs").value = data.objectifs || "";
      document.getElementById("reseaux").value = data.reseaux || "";
      document.getElementById("photoPreview").src = data.photoURL || "";
    } else {
      console.log("Aucune donnée trouvée pour cet utilisateur.");
    }
  } else {
    console.log("Utilisateur non connecté");
  }
});

});
