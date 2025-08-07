import { auth, provider } from "./firebaseconfig.js";
import { signInWithEmailAndPassword, signInWithPopup } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

const loginForm = document.getElementById('form');
const googleBtn = document.getElementById('btn-google');
const errorMessage = document.querySelector('.message');  // <--- ici on cible la classe .message

if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = loginForm.email.value;
    const password = loginForm.password.value;
    try {
      await signInWithEmailAndPassword(auth, email, password);
      window.location.href = "compte.html";
    } catch (error) {
      errorMessage.textContent = "Erreur de connexion : " + error.message;
    }
  });
} else {
  console.warn("Formulaire de connexion introuvable !");
}

if (googleBtn) {
  googleBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    try {
      await signInWithPopup(auth, provider);
      window.location.href = "compte.html";
    } catch (error) {
      errorMessage.textContent = "Erreur Google : " + error.message;
    }
  });
} else {
  console.warn("Bouton Google introuvable !");
}
