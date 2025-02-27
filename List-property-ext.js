import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    getAuth, 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { 
    getFirestore, 
    collection, 
    addDoc, 
    doc, 
    updateDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { 
    getStorage,
    ref,
    uploadBytes,
    getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyAcjlRrl_Lfoma3b7ue9lqX9O81ctgWcAo",
    authDomain: "soonmove-a1f40.firebaseapp.com",
    projectId: "soonmove-a1f40",
    storageBucket: "soonmove-a1f40.firebasestorage.app",
    appId: "1:781161740833:web:b8caef79c1a70c235b0160",
    measurementId: "G-G8MQP6GHBE"
};
initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore();
const storage = getStorage();

// Auth State Initialization
onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = '/login.html';
    }
});

// Enhanced Image Upload Handler
async function uploadPropertyImages(userId, files) {
    const storagePath = `properties/${userId}`;
    const imageUrls = [];
    
    for (const file of files) {
        const fileRef = ref(storage, `${storagePath}/${Date.now()}_${file.name}`);
        await uploadBytes(fileRef, file);
        const url = await getDownloadURL(fileRef);
        imageUrls.push(url);
    }
    
    return imageUrls;
}

// Form Submission Handler
async function handleFormSubmission(formData) {
    const user = auth.currentUser;
    if (!user) throw new Error("User is not authenticated.");

    try {
        // Upload Property Images to Storage
        const images = await uploadPropertyImages(user.uid, formData.images);
        
        // Prepare Property Metadata for Firestore
        const propertyData = {
            ...formData,
            images: images.length ? images : null,
            createdAt: new Date().toISOString(),
            userId: user.uid,
            status: 'pending',
        };

        // Save to Firestore
        const docRef = await addDoc(collection(db, "properties"), propertyData);
        return docRef.id;
        
    } catch (error) {
        console.error("Error listing property:", error);
        throw error;
    }
}

// Upload Property and Show Preview
function showPreview() {
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

    // Generate Preview HTML
    const previewContent = document.getElementById('previewContent');
    previewContent.innerHTML = `
        <p><strong>Bedrooms:</strong> ${formData.bedrooms}</p>
        <p><strong>Rent:</strong> £${formData.rent}/
          ${formData.pricePeriod}</p>
        <p><strong>Address:</strong> ${formData.address.houseNumber}, ${formData.address.street}, 
            ${formData.address.city}, ${formData.address.postcode}, ${formData.address.county}</p>
        <p><strong>Description:</strong> ${formData.description}</p>
        <p><strong>Contact:</strong> ${formData.contact.name} (${formData.contact.phone})</p>
        <p><strong>Property Type:</strong> 
          ${formData.userType}</p>
        ${formData.images.length ? 
          `<p><strong>Image Count:</strong> ${formData.images.length}</p>` : 
          ``}
    `;

    // Display Preview Modal
    document.getElementById('previewModal').style.display = 'block';
}

function closePreview() {
    document.getElementById('previewModal').style.display = 'none';
}

// Submit Form with Error Handling
document.querySelector('form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    try {
        // Show loading state
        document.querySelector('.submit-btn').disabled = true;

        // Process Form Submission
        await handleFormSubmission({
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
        });

        // Success Feedback
        alert('Property listed successfully!');
        window.location.href = '/Dash.html';

    } catch (error) {
        // Error Feedback
        console.error('Form submission error:', error);
        alert(`Error: ${error.message}`);

    } finally {
        // Reset loading state
        document.querySelector('.submit-btn').disabled = false;
    }
});