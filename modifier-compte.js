import { auth, db, storage } from "./firebaseconfig.js";
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-storage.js";

const form = document.getElementById('form');
const message = document.getElementById('message');

const photoInput = document.getElementById('photo');
const preview = document.getElementById('preview');

let photoFile = null;

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
        callback(blob);
      }, 'image/jpeg', 0.8);
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(file);
}

photoInput.addEventListener('change', () => {
  const file = photoInput.files[0];
  if (!file) return;

  resizeImage(file, 800, 800, (blob) => {
    photoFile = blob;

    const reader = new FileReader();
    reader.onload = (e) => {
      preview.src = e.target.result;
      preview.style.display = 'block';
    };
    reader.readAsDataURL(blob);
  });
});

function creerInput(placeholder) {
  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = placeholder;
  input.style.display = 'block';
  input.style.marginBottom = '8px';
  return input;
}

document.getElementById('add-objectif').addEventListener('click', () => {
  document.getElementById('objectif-container').appendChild(creerInput('Nouvel objectif'));
});
document.getElementById('clear-objectif').addEventListener('click', () => {
  document.getElementById('objectif-container').innerHTML = '';
});
document.getElementById('add-passion').addEventListener('click', () => {
  document.getElementById('passion-container').appendChild(creerInput('Nouvelle passion'));
});
document.getElementById('clear-passions').addEventListener('click', () => {
  document.getElementById('passion-container').innerHTML = '';
});

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

    const objectifContainer = document.getElementById('objectif-container');
    objectifContainer.innerHTML = '';
    if (Array.isArray(data.objectifs) && data.objectifs.length) {
      data.objectifs.forEach(obj => {
        const input = creerInput('Objectif');
        input.value = obj;
        objectifContainer.appendChild(input);
      });
    } else {
      objectifContainer.appendChild(creerInput('Nouvel objectif'));
    }

    const passionContainer = document.getElementById('passion-container');
    passionContainer.innerHTML = '';
    if (Array.isArray(data.passions) && data.passions.length) {
      data.passions.forEach(pas => {
        const input = creerInput('Passion');
        input.value = pas;
        passionContainer.appendChild(input);
      });
    } else {
      passionContainer.appendChild(creerInput('Nouvelle passion'));
    }

    if (data.reseaux) {
      form.instagram.value = data.reseaux.instagram ? data.reseaux.instagram.replace("https://www.instagram.com/", "") : '';
      form.tiktok.value = data.reseaux.tiktok ? data.reseaux.tiktok.replace("https://www.tiktok.com/@", "") : '';
      form.snapchat.value = data.reseaux.snapchat ? data.reseaux.snapchat.replace("https://snapchat.com/add/", "") : '';
    } else {
      form.instagram.value = '';
      form.tiktok.value = '';
      form.snapchat.value = '';
    }

    if (data.photoUrl && data.photoUrl.trim() !== '') {
      preview.src = data.photoUrl;
      preview.style.display = 'block';
      photoFile = null;
    } else {
      preview.style.display = 'none';
    }
  }
}

onAuthStateChanged(auth, (user) => {
  if (user) {
    remplirFormulaire(user);
  } else {
    message.textContent = 'Tu dois être connecté pour modifier ton profil.';
  }
});

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const user = auth.currentUser;
  if (!user) {
    message.textContent = "Erreur : utilisateur non connecté.";
    message.style.color = 'red';
    return;
  }

  message.textContent = "Enregistrement en cours...";
  message.style.color = 'black';

  let photoUrl = '';

  if (photoFile) {
    try {
      const photoRef = ref(storage, `photos/${user.uid}.jpg`);
      await uploadBytes(photoRef, photoFile);
      photoUrl = await getDownloadURL(photoRef);
    } catch (error) {
      console.error("Erreur upload photo:", error);
      message.textContent = "Erreur lors de l’upload de la photo.";
      message.style.color = 'red';
      return;
    }
  } else {
    photoUrl = preview.src || '';
  }

  const objectifs = Array.from(document.querySelectorAll('#objectif-container input'))
    .map(i => i.value.trim())
    .filter(Boolean);

  const passions = Array.from(document.querySelectorAll('#passion-container input'))
    .map(i => i.value.trim())
    .filter(Boolean);

  const pseudoInstagram = form.instagram.value.trim();
  const pseudoTiktok = form.tiktok.value.trim();
  const pseudoSnapchat = form.snapchat.value.trim();

  const instagram = pseudoInstagram ? `https://www.instagram.com/${pseudoInstagram}` : '';
  const tiktok = pseudoTiktok ? `https://www.tiktok.com/@${pseudoTiktok}` : '';
  const snapchat = pseudoSnapchat ? `https://snapchat.com/add/${pseudoSnapchat}` : '';

  try {
    await setDoc(doc(db, 'utilisateurs', user.uid), {
      prenom: form.prenom.value.trim(),
      nom: form.nom.value.trim(),
      age: parseInt(form.age.value.trim()) || null,
      ville: form.ville.value.trim(),
      vaALecole: form['ecole?'].value,
      ecole: form.ecole.value.trim(),
      niveau: form.niveau.value,
      ambition: form.ambition.value.trim(),
      objectifs,
      passions,
      tempslibre: form.tempslibre.value.trim(),
      parletoi: form.parletoi.value.trim(),
      raison: form.raison.value.trim(),
      competence: form.competence.value.trim(),
      reseaux: {
        instagram,
        tiktok,
        snapchat
      },
      photoUrl,
      uid: user.uid
    }, { merge: true });

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
