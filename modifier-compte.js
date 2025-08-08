import { auth, db } from './firebaseconfig.js';
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

const form = document.getElementById('form');
const message = document.getElementById('message');

const photoInput = document.getElementById('photo');
const preview = document.getElementById('preview');

let photoBase64 = ""; // pour stocker photo actuelle ou nouvelle

// Création d’un input texte simple (pour objectifs et passions)
function creerInput(placeholder) {
  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = placeholder;
  input.style.display = 'block';
  input.style.marginBottom = '8px';
  return input;
}

// Gestion dynamique des objectifs
document.getElementById('add-objectif').addEventListener('click', () => {
  const container = document.getElementById('objectif-container');
  container.appendChild(creerInput('Nouvel objectif'));
});

document.getElementById('clear-objectif').addEventListener('click', () => {
  const container = document.getElementById('objectif-container');
  container.innerHTML = '';
});

// Gestion dynamique des passions
document.getElementById('add-passion').addEventListener('click', () => {
  const container = document.getElementById('passion-container');
  container.appendChild(creerInput('Nouvelle passion'));
});

document.getElementById('clear-passions').addEventListener('click', () => {
  const container = document.getElementById('passion-container');
  container.innerHTML = '';
});

// Fonction pour remplir formulaire avec données existantes
async function remplirFormulaire(user) {
  const userRef = doc(db, 'utilisateurs', user.uid);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    const data = userSnap.data();

    form.prenom.value = data.prenom || '';
    form.nom.value = data.nom || '';
    form.age.value = data.age || '';
    form.ville.value = data.ville || '';
    form['ecole?'].value = data.vaALecole || '';
    form.ecole.value = data.ecole || '';
    form.niveau.value = data.niveau || '';
    form.ambition.value = data.ambition || '';
    form.tempslibre.value = data.tempslibre || '';
    form.parletoi.value = data.parletoi || '';
    form.raison.value = data.raison || '';
    form.competence.value = data.competence || '';

    // Objectifs
    const objectifContainer = document.getElementById('objectif-container');
    objectifContainer.innerHTML = '';
    if (Array.isArray(data.objectifs) && data.objectifs.length > 0) {
      data.objectifs.forEach(obj => {
        const input = creerInput('Objectif');
        input.value = obj;
        objectifContainer.appendChild(input);
      });
    } else {
      objectifContainer.appendChild(creerInput('Nouvel objectif'));
    }

    // Passions
    const passionContainer = document.getElementById('passion-container');
    passionContainer.innerHTML = '';
    if (Array.isArray(data.passions) && data.passions.length > 0) {
      data.passions.forEach(pas => {
        const input = creerInput('Passion');
        input.value = pas;
        passionContainer.appendChild(input);
      });
    } else {
      passionContainer.appendChild(creerInput('Nouvelle passion'));
    }

    // Réseaux sociaux
    if (data.reseaux) {
      form.instagram.value = data.reseaux.instagram || '';
      form.tiktok.value = data.reseaux.tiktok || '';
      if (data.reseaux.snapchat) {
        const snapUrl = data.reseaux.snapchat;
        const pseudo = snapUrl.split("/add/")[1] || '';
        form.snapchat.value = pseudo;
      }
    } else {
      form.instagram.value = '';
      form.tiktok.value = '';
      form.snapchat.value = '';
    }

    // Photo
    if (data.photoUrl && data.photoUrl.trim() !== '') {
      photoBase64 = data.photoUrl;
      preview.src = photoBase64;
      preview.style.display = 'block';
    } else {
      preview.style.display = 'none';
    }
  } else {
    console.log('Pas de données dans Firestore pour cet utilisateur.');
  }
}

// Quand utilisateur connecté, remplir formulaire
onAuthStateChanged(auth, (user) => {
  if (user) {
    remplirFormulaire(user);
  } else {
    message.textContent = 'Tu dois être connecté pour modifier ton profil.';
  }
});

// Si utilisateur change photo, lire en base64
photoInput.addEventListener('change', () => {
  const file = photoInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    photoBase64 = reader.result;
    preview.src = photoBase64;
    preview.style.display = 'block';
  };
  reader.readAsDataURL(file);
});

// Soumission du formulaire : enregistrement dans Firestore
form.addEventListener('submit', async (event) => {
  event.preventDefault(); // ✅ Empêche le rechargement de la page

  const user = auth.currentUser;
  if (!user) {
    message.textContent = "Erreur : utilisateur non connecté.";
    return;
  }

  const prenom = form.prenom.value.trim();
  const nom = form.nom.value.trim();
  const age = parseInt(form.age.value.trim());
  const ville = form.ville.value.trim();
  const vaALecole = form['ecole?'].value;
  const ecole = form.ecole.value.trim();
  const niveau = form.niveau.value;
  const ambition = form.ambition.value.trim();
  const tempslibre = form.tempslibre.value.trim();
  const parletoi = form.parletoi.value.trim();
  const raison = form.raison.value.trim();
  const competence = form.competence.value.trim();

  // Objectifs valides
  const objectifs = [];
  document.getElementById('objectif-container').querySelectorAll('input').forEach(input => {
    if (input.value.trim()) objectifs.push(input.value.trim());
  });

  // Passions valides
  const passions = [];
  document.getElementById('passion-container').querySelectorAll('input').forEach(input => {
    if (input.value.trim()) passions.push(input.value.trim());
  });

const pseudoInstagram = form.instagram.value.trim();
const pseudoTiktok = form.tiktok.value.trim();
const pseudoSnap = form.snapchat.value.trim();

const instagram = pseudoInstagram ? `https://www.instagram.com/${pseudoInstagram}` : '';
const tiktok = pseudoTiktok ? `https://www.tiktok.com/@${pseudoTiktok}` : '';
const snapchat = pseudoSnap ? `https://snapchat.com/add/${pseudoSnap}` : '';


  try {
    await setDoc(doc(db, 'utilisateurs', user.uid), {
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
      photoUrl: photoBase64 || '',
      uid: user.uid
    });

    message.textContent = "Profil enregistré avec succès !";
    message.style.color = 'green';

    setTimeout(() => {
      location.href = "compte.html";
    }, 1500);

  } catch (error) {
    console.error("Erreur lors de l'enregistrement :", error);
    message.textContent = "Erreur lors de l'enregistrement.";
    message.style.color = 'red';
  }
});
