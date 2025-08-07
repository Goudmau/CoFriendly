// ---- Traitement et compression d'une image pour mobile ----

// paramètres : modifie si tu veux
const MAX_WIDTH = 800;
const MAX_HEIGHT = 800;
const MAX_KO = 900;      // taille max souhaitée en Ko
const START_QUALITY = 0.9;
const MIN_QUALITY = 0.4;
const QUALITY_STEP = 0.05;

// utilitaire : lit un fichier en DataURL
function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Erreur lecture fichier"));
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });
}

// utilitaire : calcule la taille approximative en Ko d'un base64
function base64SizeKo(base64) {
  return (base64.length * 3 / 4) / 1024;
}

// fonction qui redimensionne / compresse et retourne un dataURL
async function processImageFile(file) {
  // vérifier que c'est bien une image et pas un HEIC (HEIC souvent pose problème)
  if (!file.type || !file.type.startsWith("image/")) {
    throw new Error("Le fichier n'est pas une image valide.");
  }
  // Certains iPhone exportent en image/heic ou image/heif -> navigateur peut ne pas lire
  if (file.type.includes("heic") || file.type.includes("heif")) {
    throw new Error("Format HEIC non supporté par le navigateur. Convertis en JPG/PNG.");
  }

  // Si le fichier est déjà petit (< max), on peut essayer d'utiliser directement mais on convertira quand même pour standardiser
  const dataUrl = await fileToDataURL(file);

  // créer une image pour obtenir dimensions
  const img = await new Promise((resolve, reject) => {
    const image = new Image();
    image.onerror = () => reject(new Error("Erreur chargement image"));
    image.onload = () => resolve(image);
    image.src = dataUrl;
  });

  // calcul nouvelle taille en conservant ratio
  let width = img.width;
  let height = img.height;
  if (width > height) {
    if (width > MAX_WIDTH) {
      height = Math.round(height * (MAX_WIDTH / width));
      width = MAX_WIDTH;
    }
  } else {
    if (height > MAX_HEIGHT) {
      width = Math.round(width * (MAX_HEIGHT / height));
      height = MAX_HEIGHT;
    }
  }

  // dessiner sur canvas
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, width, height);

  // essayer plusieurs qualités jusqu'à atteindre la limite
  let quality = START_QUALITY;
  let outputDataUrl = canvas.toDataURL('image/jpeg', quality);
  let tailleKo = base64SizeKo(outputDataUrl);

  while (tailleKo > MAX_KO && quality >= MIN_QUALITY) {
    quality = Math.max(MIN_QUALITY, quality - QUALITY_STEP);
    outputDataUrl = canvas.toDataURL('image/jpeg', quality);
    tailleKo = base64SizeKo(outputDataUrl);
    console.log(`Compression -> quality=${quality.toFixed(2)}, taille=${tailleKo.toFixed(1)}Ko`);
    // petite sécurité pour éviter boucle inf
    if (quality <= MIN_QUALITY) break;
  }

  // si malgré tout c'est trop gros, on échoue proprement
  if (tailleKo > MAX_KO) {
    throw new Error(`Image trop lourde après compression (${Math.round(tailleKo)}Ko). Choisis une image plus petite.`);
  }

  return outputDataUrl;
}

// Gestion du change du input (remplace ton ancien listener)
photoInput.addEventListener('change', async () => {
  const file = photoInput.files[0];
  if (!file) return;

  console.log("Fichier choisi :", file.name, file.type, file.size, "bytes");

  try {
    // limiter taille brute avant tout (exclusion rapide)
    if (file.size > 15 * 1024 * 1024) { // > 15Mo improbable à gérer
      alert("Fichier trop gros (>15 Mo). Choisis une image plus petite.");
      photoInput.value = '';
      return;
    }

    // traitement + compression
    const processedBase64 = await processImageFile(file);

    // debug
    console.log("Image traitée, taille finale Ko:", base64SizeKo(processedBase64).toFixed(1));

    // assigner globalement pour l'enregistrement
    photoBase64 = processedBase64;
    preview.src = photoBase64;
    preview.style.display = 'block';
  } catch (err) {
    console.error("Erreur lors du traitement de l'image :", err);
    alert("Erreur image : " + (err.message || "Impossible de traiter l'image."));
    photoInput.value = ''; // reset
    preview.style.display = 'none';
  }
});

// Soumission du formulaire : on vérifie que photoBase64 est prête (remplace ton submit)
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const user = auth.currentUser;
  if (!user) {
    message.textContent = "Erreur : utilisateur non connecté.";
    return;
  }

  // récupérer valeurs du formulaire (comme avant)
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

  // IMPORTANT : s'assurer que photoBase64 est défini si une image a été choisie
  // (photoBase64 est set dans le change event; si l'utilisateur vient de choisir une image
  // et que le traitement est encore en cours, il faudrait attendre, mais notre change utilise await,
  // donc photoBase64 doit être prêt ici)
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
  // ✅ Charger les données existantes de l'utilisateur au démarrage
auth.onAuthStateChanged(async (user) => {
  if (!user) return;

  try {
    const docRef = doc(db, 'utilisateurs', user.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();

      // Pré-remplir le formulaire
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
      const objInputs = document.querySelectorAll('#objectif-container input');
      data.objectifs?.forEach((obj, i) => {
        if (objInputs[i]) objInputs[i].value = obj;
      });

      // Passions
      const passInputs = document.querySelectorAll('#passion-container input');
      data.passions?.forEach((pass, i) => {
        if (passInputs[i]) passInputs[i].value = pass;
      });

      // Réseaux
      if (data.reseaux) {
        if (data.reseaux.instagram) {
          form.instagram.value = data.reseaux.instagram.replace("https://www.instagram.com/", "");
        }
        if (data.reseaux.tiktok) {
          form.tiktok.value = data.reseaux.tiktok.replace("https://www.tiktok.com/@", "");
        }
        if (data.reseaux.snapchat) {
          form.snapchat.value = data.reseaux.snapchat.replace("https://snapchat.com/add/", "");
        }
      }

      // Photo
      if (data.photoUrl) {
        preview.src = data.photoUrl;
        preview.style.display = 'block';
        photoBase64 = data.photoUrl; // garder la photo si on ne change pas
      }
    }
  } catch (err) {
    console.error("Erreur lors du chargement des données :", err);
  }
});

});
