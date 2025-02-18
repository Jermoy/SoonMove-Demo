import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
  getAuth, 
  onAuthStateChanged,
  signOut 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { 
  getFirestore,
  doc,
  getDoc,
  updateDoc,
  deleteField,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { 
  getStorage,
  ref,
  deleteObject
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
const storage = getStorage(app);

let dashboardState = {
  uploadedProperties: [],
  recentlyViewed: [],
  favorites: [],
  currentUser: null
};

document.addEventListener('DOMContentLoaded', () => {
  initializeAuthState();
  setupEventListeners();
});

async function initializeAuthState() {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      dashboardState.currentUser = user;
      setupNavigation(user);
      await loadUserData(user.uid);
    } else {
      window.location.href = '/login.html';
    }
  });
}

async function loadUserData(userId) {
  const userRef = doc(db, 'users', userId);
  
  onSnapshot(userRef, (doc) => {
    if (doc.exists()) {
      const data = doc.data();
      dashboardState.uploadedProperties = data.properties || [];
      dashboardState.favorites = data.favorites || [];
      renderDashboard();
    }
  });
}

function setupNavigation(user) {
  const navLinks = document.querySelector('.nav-links');
  if (navLinks) {
    navLinks.innerHTML = `
      <a href="#">Home</a>
      <a href="#">Search</a>
      <a href="#">List Property</a>
      <a href="#" class="active">Dashboard</a>
      <button class="logout-btn">Logout</button>
    `;
    
    document.querySelector('.logout-btn').addEventListener('click', () => {
      signOut(auth);
    });
  }
}

function setupEventListeners() {
  document.querySelector('.menu-icon')?.addEventListener('click', toggleMobileMenu);
  setupPropertyActions();
}

function toggleMobileMenu() {
  const navLinks = document.querySelector('.nav-links');
  navLinks.classList.toggle('responsive');
}

function setupPropertyActions() {
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('edit-btn')) {
      const propertyId = e.target.closest('.property-item').dataset.id;
      handleEditProperty(propertyId);
    }
    
    if (e.target.classList.contains('delete-btn')) {
      const propertyId = e.target.closest('.property-item').dataset.id;
      handleDeleteProperty(propertyId);
    }
    
    if (e.target.classList.contains('favorite-btn')) {
      const propertyId = e.target.closest('.property-item').dataset.id;
      toggleFavorite(propertyId);
    }
  });
}

async function handleEditProperty(propertyId) {
  const property = dashboardState.uploadedProperties.find(p => p.id === propertyId);
  if (!property) return;

  const newTitle = prompt('Enter new title:', property.title);
  if (newTitle) {
    await updateProperty(propertyId, { title: newTitle });
  }
}

async function handleDeleteProperty(propertyId) {
  if (confirm('Are you sure you want to delete this property?')) {
    // Delete images from storage
    const property = dashboardState.uploadedProperties.find(p => p.id === propertyId);
    if (property?.images) {
      await Promise.all(property.images.map(async (imageUrl) => {
        const imageRef = ref(storage, imageUrl);
        await deleteObject(imageRef);
      }));
    }
    
    await deleteProperty(propertyId);
  }
}

async function toggleFavorite(propertyId) {
  const userRef = doc(db, 'users', dashboardState.currentUser.uid);
  const isFavorite = dashboardState.favorites.includes(propertyId);
  
  await updateDoc(userRef, {
    favorites: isFavorite ? 
      dashboardState.favorites.filter(id => id !== propertyId) :
      [...dashboardState.favorites, propertyId]
  });
}

async function updateProperty(propertyId, updates) {
  const userRef = doc(db, 'users', dashboardState.currentUser.uid);
  
  await updateDoc(userRef, {
    [`properties.${propertyId}`]: {
      ...updates,
      lastModified: new Date().toISOString()
    }
  });
}

async function deleteProperty(propertyId) {
  const userRef = doc(db, 'users', dashboardState.currentUser.uid);
  
  await updateDoc(userRef, {
    [`properties.${propertyId}`]: deleteField(),
    favorites: dashboardState.favorites.filter(id => id !== propertyId)
  });
}

function renderDashboard() {
  renderUploadedProperties();
  renderFavorites();
  updateSectionCounts();
}

function renderUploadedProperties() {
  const container = document.querySelector('.dashboard-section:first-child .property-list');
  if (!container) return;

  container.innerHTML = dashboardState.uploadedProperties
    .map(property => createPropertyCard(property, true))
    .join('');
}

function renderFavorites() {
  const container = document.querySelector('.favorited-properties .property-list');
  if (!container) return;

  container.innerHTML = dashboardState.favorites
    .map(propertyId => {
      const property = dashboardState.uploadedProperties.find(p => p.id === propertyId);
      return property ? createPropertyCard(property, false, true) : '';
    })
    .join('');
}

function updateSectionCounts() {
  document.querySelectorAll('.section-count').forEach(element => {
    const section = element.closest('.dashboard-section');
    if (section.classList.contains('uploaded-properties')) {
      element.textContent = dashboardState.uploadedProperties.length;
    } else if (section.classList.contains('favorited-properties')) {
      element.textContent = dashboardState.favorites.length;
    }
  });
}

function createPropertyCard(property, showActions = false, isFavorite = false) {
  return `
    <div class="property-item" data-id="${property.id}">
      <div class="property-thumbnail">
        ${property.images?.length ? 
          `<img src="${property.images[0]}" alt="${property.title}">` : 
          `<div class="no-image">No Image</div>`}
      </div>
      <div class="property-details">
        <div class="property-title">${property.title}</div>
        <div class="property-location">${property.location}</div>
        <div class="property-price">${property.price}</div>
      </div>
      ${showActions ? `
        <div class="property-actions">
          <button class="action-btn edit-btn">Edit</button>
          <button class="action-btn delete-btn">Delete</button>
        </div>
      ` : ''}
      <button class="favorite-btn ${isFavorite ? 'active' : ''}">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="${isFavorite ? 'currentColor' : 'none'}" stroke="currentColor">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
      </button>
    </div>
  `;
}

function toggleLoading(isLoading) {
  const loader = document.getElementById('loadingSpinner');
  const content = document.querySelector('.dashboard');
  if (loader && content) {
    loader.style.display = isLoading ? 'flex' : 'none';
    content.style.opacity = isLoading ? '0.5' : '1';
  }
}

// Error handling
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  alert(`Error: ${event.reason.message}`);
  toggleLoading(false);
});