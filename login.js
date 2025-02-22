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

const firebaseConfig = {
  apiKey: "AIzaSyAcjlRrl_Lfoma3b7ue9lqX9O81ctgWcAo",
  authDomain: "soonmove-a1f40.firebaseapp.com",
  databaseURL: "https://soonmove-a1f40-default-rtdb.firebaseio.com",
  projectId: "soonmove-a1f40",
  storageBucket: "soonmove-a1f40.firebasestorage.app",
  messagingSenderId: "781161740833",
  appId: "1:781161740833:web:b8caef79c1a70c235b0160",
  measurementId: "G-G8MQP6GHBE"
};

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
  const loadingSpinner = document.getElementById('loadingSpinner');
  const generalError = document.getElementById('generalError');

  if (!loginForm) return;

  const toggleLoading = (isLoading) => {
    if (isLoading) {
      loginForm.classList.add('form-disabled');
      if (loadingSpinner) loadingSpinner.style.display = 'flex';
    } else {
      loginForm.classList.remove('form-disabled');
      if (loadingSpinner) loadingSpinner.style.display = 'none';
    }
  };

  const clearErrors = () => {
    if (emailError) emailError.style.display = 'none';
    if (passwordError) passwordError.style.display = 'none';
    if (generalError) generalError.style.display = 'none';
  };

  const showError = (element, message) => {
    if (element) {
      element.textContent = message;
      element.style.display = 'block';
    }
  };

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();
    toggleLoading(true);

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    const rememberMe = rememberMeCheckbox.checked;

    try {
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
      await signInWithEmailAndPassword(auth, email, password);
      window.location.href = '/dashboard.html';
    } catch (error) {
      toggleLoading(false);
      handleAuthError(error);
    }
  });

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

  socialButtons.forEach(button => {
    button.addEventListener('click', async (e) => {
      const providerType = e.currentTarget.getAttribute('aria-label');
      let provider;
      
      if (providerType.includes('Google')) {
        provider = new GoogleAuthProvider();
      } else if (providerType.includes('Facebook')) {
        provider = new FacebookAuthProvider();
      } else {
        alert('This social login is not supported yet');
        return;
      }

      try {
        toggleLoading(true);
        await signInWithPopup(auth, provider);
        window.location.href = '/dashboard.html';
      } catch (error) {
        toggleLoading(false);
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
      case 'auth/too-many-requests':
        showError(generalError, 'Too many attempts. Try again later.');
        break;
      default:
        alert(`Error: ${error.message}`);
    }
  }
}

// Initialize login functionality
initializeLogin();