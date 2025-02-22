// app.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAcjlRrl_Lfoma3b7ue9lqX9O81ctgWcAo",
  authDomain: "soonmove-a1f40.firebaseapp.com",
  projectId: "soonmove-a1f40",
  storageBucket: "soonmove-a1f40.firebasestorage.app",
  messagingSenderId: "781161740833",
  appId: "1:781161740833:web:b8caef79c1a70c235b0160",
  measurementId: "G-G8MQP6GHBE"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

onAuthStateChanged(auth, (user) => {
  if (user) {
    window.location.href = '/dashboard.html';
  } else {
    window.location.href = '/login.html';
  }
});