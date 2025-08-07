import { auth } from "./firebaseconfig.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

const form = document.getElementById("form");

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  signInWithEmailAndPassword(auth, email, password)
    .then(() => {
      document.querySelector(".message").textContent = "Connexion réussie ! ✅";
      setTimeout(() => window.location.href = "explorer.html", 1000);
    })
    .catch((error) => {
      document.querySelector(".message").textContent = "Erreur : " + error.message;
    });
});

import { signInWithPopup } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import {provider } from "./firebaseconfig.js";
// Ne redeclare surtout pas `auth`, utilise-le directement

document.getElementById("btn-google").addEventListener("click", () => {
  signInWithPopup(auth, provider)
    .then((result) => {
      const user = result.user;
      console.log("Connecté avec Google :", user);
      location.href = "explorer.html"
    })
    .catch((error) => {
      console.error("Erreur Google :", error);
    });
});
