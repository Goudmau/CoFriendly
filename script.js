// explorer.js
import { auth } from "./firebaseconfig.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

onAuthStateChanged(auth, (user) => {
  const compteLink = document.getElementById("connexionBtn");
  if (user) {
    compteLink.textContent = "Mon compte";
    compteLink.href = "mon-compte.html";
  } else {
    compteLink.textContent = "Connexion";
    compteLink.href = "connexion.html";
  }
});

const menuToggle = document.getElementById('menu-toggle');
const navLinks = document.getElementById('nav-links');

menuToggle.addEventListener('click', () => {
  navLinks.classList.toggle('show');
});
