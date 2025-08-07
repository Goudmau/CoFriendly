// auth.js
import { auth } from "./firebaseconfig.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

const authLink = document.getElementById("auth-link");

onAuthStateChanged(auth, (user) => {
  if (user) {
    authLink.textContent = "Mon compte";
    authLink.href = "compte.html"; // ou explorer.html si tu veux
  } else {
    authLink.textContent = "Connexion";
    authLink.href = "connexion.html";
  }
});
