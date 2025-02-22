// IMPORT FIREBASE MODULES
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
  getAuth, 
  onAuthStateChanged,
  signOut 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { 
  getFirestore,
  collection,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  arrayUnion,
  arrayRemove,
  onSnapshot,
  query,
  where
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// FIREBASE CONFIGURATION
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

// INITIALIZATIONS
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// GLOBAL STATE
let currentUser = null;

// DOM ELEMENTS
const logoutButton = document.querySelector('.logout-btn');
const propertySections = document.querySelectorAll('.property-list');
const loadingSpinner = document.getElementById('loadingSpinner');

// MAIN FUNCTIONS
document.addEventListener('DOMContentLoaded', async () => {
  // Navigation
  setupNavigation();
  // Load User Data
  initializeAuthListener();
  // Setup Interactions
  setupEventListeners();
});

// AUTHENTICATION
function initializeAuthListener() {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      currentUser = user;
      showDashboard(user.uid);
    } else {
      window.location.href = '/login.html';
    }
  });
}

async function showDashboard(userId) {
  // Show Loading Spinner
  toggleLoading(true);

  // Fetch User Data
  const userData = await getUserData(userId);
  if (!userData) return;

  // Render Property Sections
  renderUploadedProperties(userData.properties);
  renderRecentViewed(userData.recentViews);
  renderFavoritedProperties(userData.favorites);

  // Hide Loading Spinner
  toggleLoading(false);
}

async function getUserData(userId) {
  const docRef = doc(db, 'users', userId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data() : null;
}

// DATA RENDERING
function renderUploadedProperties(properties) {
  const container = document.querySelector('.uploaded-properties .property-list');
  container.innerHTML = '';

  properties.forEach(property => {
    const html = createPropertyCard(property, true);
    container.insertAdjacentHTML('beforeend', html);
  });
}

function renderRecentViewed(properties) {
  const container = document.querySelector('.recently-viewed .property-list');
  container.innerHTML = '';

  properties.forEach(property => {
    const html = createPropertyCard(property);
    container.insertAdjacentHTML('beforeend', html);
  });
}

function renderFavoritedProperties(properties) {
  const container = document.querySelector('.favorited-properties .property-list');
  container.innerHTML = '';

  properties.forEach(property => {
    const html = createPropertyCard(property, false, true);
    container.insertAdjacentHTML('beforeend', html);
  });
}

function createPropertyCard(property, showActions = false, isFavorite = false) {
  return `
    <div class="property-item" data-id="${property.id}">
      <div class="property-thumbnail">
        <img src="${property.thumbnail || '/api/placeholder/100/80'}" alt="Property">
      </div>
      <div class="property-details">
        <h4>${property.title || 'No Title'}</h4>
        <p>${property.address.city || 'Location'} | £${property.rent || 0}/${property.pricePeriod || 'month'}</p>
      </div>
      ${showActions ? `
        <div class="property-actions">
          <button class="action-btn edit-btn">Edit</button>
          <button class="action-btn delete-btn">Delete</button>
        </div>
      ` : ''}
      <button class="favorite-btn ${isFavorite ? 'active' : ''}">${isFavorite ? '<i class="fas fa-heart"></i>' : '<i class="far fa-heart"></i>'}</button>
    </div>
  `;
}

// EVENT LISTENERS
function setupNavigation() {
  logoutButton?.addEventListener('click', () => {
    signOut(auth).then(() => {
      window.location.href = '/login.html';
    });
  });
}

function setupEventListeners() {
  document.querySelector('.menu-icon')?.addEventListener('click', toggleMobileMenu);
  document.addEventListener('click', handlePropertyActions);
}

function toggleMobileMenu() {
  const navLinks = document.querySelector('.nav-links');
  navLinks.classList.toggle('responsive');
}

async function handlePropertyActions(e) {
  const target = e.target;
  const propertyItem = target.closest('.property-item');
  if (!propertyItem) return;

  const propertyId = propertyItem.dataset.id;
  if (!propertyId) return;

  if (target.classList.contains('edit-btn')) {
    handleEditProperty(propertyId);
  } else if (target.classList.contains('delete-btn')) {
    handleDeleteProperty(propertyId);
  } else if (target.classList.contains('favorite-btn')) {
    handleFavoriteProperty(propertyId);
  }
}

// PROPERTY ACTIONS
async function handleEditProperty(propertyId) {
  const newUserProperties = await updatePropertyField(propertyId, 'edited', true);
  renderUploadedProperties(newUserProperties);
}

async function handleDeleteProperty(propertyId) {
  if (!confirm('Delete this property?')) return;
  
  const userRef = doc(db, 'users', currentUser.uid);
  await updateDoc(userRef, {
    properties: arrayRemove(propertyId)
  });

  const docRef = doc(db, 'properties', propertyId);
  await deleteDoc(docRef);

  showSuccessAlert('Property deleted');
  // Reloading is necessary since Firestore doesn't auto-update without a listener
  window.location.reload();
}

async function handleFavoriteProperty(propertyId) {
  const userRef = doc(db, 'users', currentUser.uid);
  await updateDoc(userRef, {
    favorites: arrayUnion(propertyId)
  });
  showSuccessAlert('Added to favorites');
}

// UTILITY FUNCTIONS
function toggleLoading(isLoading) {
  if (isLoading) {
    loadingSpinner.style.display = 'block';
    document.body.style.opacity = '0.5';
  } else {
    loadingSpinner.style.display = 'none';
    document.body.style.opacity = '1';
  }
}

function showSuccessAlert(message) {
  alert(message);
  setTimeout(() => {
    document.body.style.opacity = '1';
  }, 1000);
}

// FIRESTORE OPERATIONS
async function updatePropertyField(propertyId, field, value) {
  const userRef = doc(db, 'users', currentUser.uid);
  await updateDoc(userRef, {
    [ `properties.${propertyId}.${field}` ]: value
  });

  return (await getUserData(currentUser.uid)).properties;
}

// ERROR HANDLING
window.addEventListener('unhandledrejection', (event) => {
  alert(`Error: ${event.reason.message || event.reason}`);
  toggleLoading(false);
});