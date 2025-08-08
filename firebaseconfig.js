// firebaseconfig.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyC6Xpc0_HC9n7ddTSxph6uSs1KwmA-isrI",
  authDomain: "cofriendly-3a7dc.firebaseapp.com",
  projectId: "cofriendly-3a7dc",
  storageBucket: "cofriendly-3a7dc.appspot.com",
  messagingSenderId: "112044539408",
  appId: "1:112044539408:web:3c6173bfcbf2ac913f9495"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, provider, db, storage };
