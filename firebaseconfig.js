// Importation des fonctions Firebase depuis les CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

// Configuration Firebase de ton projet
const firebaseConfig = {
  apiKey: "AIzaSyC6Xpc0_HC9n7ddTSxph6uSs1KwmA-isrI",
  authDomain: "cofriendly-3a7dc.firebaseapp.com",
  projectId: "cofriendly-3a7dc",
  storageBucket: "cofriendly-3a7dc.appspot.com",
  messagingSenderId: "112044539408",
  appId: "1:112044539408:web:3c6173bfcbf2ac913f9495"
};

// Initialisation de l'application Firebase
const app = initializeApp(firebaseConfig);

// Initialisation de l'authentification et Firestore
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// Exportation pour utilisation dans d'autres fichiers
export { auth, db, provider };
