import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    getAuth, 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { 
    getFirestore, 
    collection, 
    addDoc 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { 
    getStorage,
    ref,
    uploadBytes,
    getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";


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

// Initialize auth state
onAuthStateChanged(auth, (user) => {
    if (!user) window.location.href = '/login.html';
});

// Enhanced image upload handler
async function uploadPropertyImages(userId, files) {
    const storageRef = ref(storage, `properties/${userId}`);
    const imageUrls = [];
    
    for (const file of files) {
        const fileRef = ref(storageRef, `${Date.now()}_${file.name}`);
        await uploadBytes(fileRef, file);
        const url = await getDownloadURL(fileRef);
        imageUrls.push(url);
    }
    
    return imageUrls;
}

// Form submission handler
async function handleFormSubmission(formData) {
    const user = auth.currentUser;
    if (!user) return;

    try {
        // Upload images
        const images = await uploadPropertyImages(user.uid, formData.images);
        
        // Prepare property data
        const propertyData = {
            ...formData,
            images,
            createdAt: new Date().toISOString(),
            userId: user.uid,
            status: 'pending'
        };

        // Save to Firestore
        const docRef = await addDoc(collection(db, "properties"), propertyData);
        return docRef.id;
        
    } catch (error) {
        console.error("Error adding property:", error);
        throw error;
    }
}

// Modified form submission
document.querySelector('form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        bedrooms: document.getElementById('bedrooms').value,
        rent: document.getElementById('rent').value,
        pricePeriod: document.querySelector('input[name="price_period"]:checked').value,
        address: {
            houseNumber: document.getElementById('address').value,
            street: document.getElementById('street').value,
            city: document.getElementById('city').value,
            postcode: document.getElementById('postcode').value,
            county: document.getElementById('county').value
        },
        description: document.getElementById('description').value,
        contact: {
            name: document.getElementById('fullname').value,
            phone: document.getElementById('phone').value,
            email: document.getElementById('email').value
        },
        userType: document.querySelector('input[name="user_type"]:checked').value,
        images: document.getElementById('propertyImage').files
    };

    try {
        await handleFormSubmission(formData);
        alert('Property listed successfully!');
        window.location.href = '/dashboard.html';
    } catch (error) {
        alert(`Error: ${error.message}`);
    }
});