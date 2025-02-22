import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is logged in, redirect to dashboard
    window.location.href = '/dashboard.html';
  } else {
    // User is logged out, redirect to login
    window.location.href = '/login.html';
  }
});