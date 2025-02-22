import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
  getAuth, 
  createUserWithEmailAndPassword,
  sendEmailVerification
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { 
  getFirestore,
  doc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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
const db = getFirestore(app);

export function initializeSignup() {
  const signupForm = document.getElementById('signupForm');
  const passwordInput = document.getElementById('password');
  const confirmPasswordInput = document.getElementById('confirmPassword');
  const loadingSpinner = document.getElementById('loadingSpinner');
  const generalError = document.getElementById('generalError');

  if (!signupForm) return;

  // Real-time password validation
  confirmPasswordInput.addEventListener('input', () => {
    validatePasswordMatch(passwordInput, confirmPasswordInput);
  });

  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();
    generalError.style.display = 'none';

    // Form data
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const confirmPassword = document.getElementById('confirmPassword').value.trim();
    const termsAccepted = document.getElementById('terms').checked;

    // Client-side validation
    if (!validateForm(firstName, lastName, email, password, confirmPassword, termsAccepted)) {
      return;
    }

    try {
      toggleLoading(true, signupForm, loadingSpinner);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Save additional user data to Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        firstName,
        lastName,
        email,
        emailVerified: false,
        createdAt: new Date()
      });

      await sendEmailVerification(userCredential.user);
      alert('Account created! Check your email for verification.');
      window.location.href = '/dashboard.html';
    } catch (error) {
      handleSignupError(error);
    } finally {
      toggleLoading(false, signupForm, loadingSpinner);
    }
  });
}

// Validation functions
function validateForm(firstName, lastName, email, password, confirmPassword, termsAccepted) {
  let isValid = true;

  if (!firstName) {
    showError('firstNameError', 'First name is required');
    isValid = false;
  }
  
  if (!lastName) {
    showError('lastNameError', 'Last name is required');
    isValid = false;
  }

  if (!validateEmail(email)) {
    showError('emailError', 'Invalid email format');
    isValid = false;
  }

  if (password.length < 8) {
    showError('passwordError', 'Password must be at least 8 characters');
    isValid = false;
  }

  if (password !== confirmPassword) {
    showError('confirmPasswordError', 'Passwords do not match');
    isValid = false;
  }

  if (!termsAccepted) {
    showError('termsError', 'You must accept the terms');
    isValid = false;
  }

  return isValid;
}

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function validatePasswordMatch(passwordInput, confirmPasswordInput) {
  if (passwordInput.value !== confirmPasswordInput.value) {
    showError('confirmPasswordError', 'Passwords do not match');
  } else {
    clearError('confirmPasswordError');
  }
}

// Error handling
function handleSignupError(error) {
  const errorMap = {
    'auth/email-already-in-use': 'Email already registered',
    'auth/invalid-email': 'Invalid email address',
    'auth/weak-password': 'Password must be at least 8 characters',
    'auth/network-request-failed': 'Network error - please try again'
  };

  const errorElementMap = {
    'auth/email-already-in-use': 'emailError',
    'auth/invalid-email': 'emailError',
    'auth/weak-password': 'passwordError'
  };

  const errorMessage = errorMap[error.code] || 'Registration failed - please try again';
  const errorElement = errorElementMap[error.code] || 'generalError';

  if (errorElement === 'generalError') {
    document.getElementById('generalError').textContent = errorMessage;
    document.getElementById('generalError').style.display = 'block';
  } else {
    showError(errorElement, errorMessage);
  }
}

// Utility functions
function showError(elementId, message) {
  const element = document.getElementById(elementId);
  if (element) {
    element.textContent = message;
    element.style.display = 'block';
  }
}

function clearError(elementId) {
  const element = document.getElementById(elementId);
  if (element) {
    element.style.display = 'none';
  }
}

function clearErrors() {
  const errors = document.querySelectorAll('.error-message');
  errors.forEach(error => error.style.display = 'none');
}

function toggleLoading(isLoading, form, spinner) {
  if (isLoading) {
    form.classList.add('form-disabled');
    spinner.style.display = 'flex';
  } else {
    form.classList.remove('form-disabled');
    spinner.style.display = 'none';
  }
}

// Initialize the signup functionality
initializeSignup();