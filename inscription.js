// inscription.js
import { auth, provider } from "./firebaseconfig.js";
import { createUserWithEmailAndPassword, signInWithPopup } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

const form = document.getElementById("form");
const btnGoogle = document.getElementById("btn-google");
const message = document.querySelector(".message");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = form.email.value;
  const password = form.password.value;

  try {
    await createUserWithEmailAndPassword(auth, email, password);
    message.style.color = "green";
    message.textContent = "Inscription réussie 🎉";
    setTimeout(() => {
      window.location.href = "connexion.html";
    }, 1000);
  } catch (error) {
    message.style.color = "red";
    message.textContent = "Erreur : " + error.message;
  }
});

btnGoogle.addEventListener("click", async (e) => {
  e.preventDefault();
  try {
    await signInWithPopup(auth, provider);
    window.location.href = "explorer.html";
  } catch (error) {
    console.error("Erreur Google :", error);
    message.style.color = "red";
    message.textContent = "Erreur lors de la connexion Google.";
  }
});
