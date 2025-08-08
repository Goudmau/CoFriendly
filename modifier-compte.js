// ✅ Fonction pour lire un fichier image en base64
function lireImageEnBase64(fichier) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(fichier);
  });
}

// ✅ Si utilisateur change photo, on lit en base64 proprement
photoInput.addEventListener('change', async () => {
  const file = photoInput.files[0];
  if (!file) return;

  try {
    const base64 = await lireImageEnBase64(file);
    const tailleKo = base64.length * (3 / 4) / 1024;

    if (tailleKo > 900) {
      alert("Image trop grande ! Choisis une image de moins de 900 Ko.");
      photoInput.value = ''; // reset input
      return;
    }

    photoBase64 = base64;
    preview.src = base64;
    preview.style.display = 'block';
  } catch (err) {
    console.error("Erreur lors de la lecture de l’image :", err);
    alert("Erreur lors de l'importation de l’image.");
  }
});

// ✅ Soumission du formulaire
form.addEventListener('submit', async (e) => {
  e.preventDefault();

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

  const objectifs = [];
  document.getElementById('objectif-container').querySelectorAll('input').forEach(input => {
    if (input.value.trim()) objectifs.push(input.value.trim());
  });

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
    message.textContent = "Erreur lors de l'enregistrement. Vérifie la taille de ta photo.";
    message.style.color = 'red';
  }
});
