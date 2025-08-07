import { getAuth, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

const auth = getAuth();

const form = document.getElementById("form");
const message = document.getElementById("message");

form.addEventListener("submit", (e) => {
    e.preventDefault();

    const email = form.email.value; // Récupère la valeur du champ email

    sendPasswordResetEmail(auth, email)
    .then(() => {
        message.textContent = "Email envoyé avec succès. Vérifiez votre boîte de réception.";
        message.style.color = "green";
        form.reset(); // reset le formulaire
        setTimeout(() => window.location.href = "connexion.html", 1000);
    })
    .catch((error) => {
        message.textContent = "Une erreur est survenue : " + error.message;
        message.style.color = "red";
    });
});
