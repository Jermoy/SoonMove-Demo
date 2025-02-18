// Import necessary Firebase functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  sendPasswordResetEmail,
  setPersistence,
  browserSessionPersistence,
  browserLocalPersistence,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// Your Firebase configuration (replace with your actual config)
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAcjlRrl_Lfoma3b7ue9lqX9O81ctgWcAo",
  authDomain: "soonmove-a1f40.firebaseapp.com",
  projectId: "soonmove-a1f40",
  storageBucket: "soonmove-a1f40.firebasestorage.app",
  messagingSenderId: "781161740833",
  appId: "1:781161740833:web:b8caef79c1a70c235b0160",
  measurementId: "G-G8MQP6GHBE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export function initializeLogin() {
  const loginForm = document.getElementById('loginForm');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const emailError = document.getElementById('emailError');
  const passwordError = document.getElementById('passwordError');
  const forgotPasswordLink = document.getElementById('forgotPassword');
  const rememberMeCheckbox = document.querySelector('input[name="remember"]');
  const socialButtons = document.querySelectorAll('.social-btn');

  if (!loginForm) return;

  // Handle form submission
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    const rememberMe = rememberMeCheckbox.checked;

    try {
      // Set session persistence
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
      
      // Firebase sign-in
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Redirect to dashboard
      window.location.href = '/dashboard.html';
    } catch (error) {
      handleAuthError(error);
    }
  });

  // Handle forgot password
  forgotPasswordLink?.addEventListener('click', async (e) => {
    e.preventDefault();
    const email = prompt('Please enter your email address:');
    
    if (email) {
      try {
        await sendPasswordResetEmail(auth, email);
        alert('Password reset email sent! Check your inbox.');
      } catch (error) {
        alert(`Error: ${error.message}`);
      }
    }
  });

  // Handle social logins
  socialButtons.forEach(button => {
    button.addEventListener('click', async (e) => {
      const provider = e.currentTarget.getAttribute('aria-label').includes('Google') 
        ? new GoogleAuthProvider()
        : new FacebookAuthProvider();

      try {
        const result = await signInWithPopup(auth, provider);
        window.location.href = '/dashboard.html';
      } catch (error) {
        handleAuthError(error);
      }
    });
  });

  function handleAuthError(error) {
    switch (error.code) {
      case 'auth/invalid-email':
        showError(emailError, 'Invalid email address');
        break;
      case 'auth/user-disabled':
        showError(emailError, 'Account disabled');
        break;
      case 'auth/user-not-found':
        showError(emailError, 'Account not found');
        break;
      case 'auth/wrong-password':
        showError(passwordError, 'Incorrect password');
        break;
      default:
        alert(`Error: ${error.message}`);
    }
  }

  function showError(element, message) {
    element.textContent = message;
    element.style.display = 'block';
  }

  function clearErrors() {
    emailError.style.display = 'none';
    passwordError.style.display = 'none';
  }
}