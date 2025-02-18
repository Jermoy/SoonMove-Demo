// Modal Handling
const bookingModal = document.getElementById('bookingModal');
const messageModal = document.getElementById('messageModal');
const closeButtons = document.getElementsByClassName('close-modal');

// Available viewing times
const viewingTimes = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '13:00', '13:30', '14:00', '14:30', '15:00', '15:30'
];

// Populate viewing times dropdown
const viewingTimeSelect = document.getElementById('viewingTime');
viewingTimes.forEach(time => {
    const option = document.createElement('option');
    option.value = time;
    option.textContent = time;
    viewingTimeSelect.appendChild(option);
});

// Handle booking button clicks
document.querySelectorAll('.view-btn').forEach(button => {
    button.addEventListener('click', () => {
        bookingModal.style.display = 'block';
        // Set minimum date to tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        document.getElementById('viewingDate').min = tomorrow.toISOString().split('T')[0];
    });
});

// Handle message button clicks
document.querySelectorAll('.message-btn').forEach(button => {
    button.addEventListener('click', () => {
        messageModal.style.display = 'block';
    });
});

// Close modal on click outside or close button
window.addEventListener('click', (event) => {
    if (event.target == bookingModal || event.target == messageModal) {
        bookingModal.style.display = 'none';
        messageModal.style.display = 'none';
    }
});

Array.from(closeButtons).forEach(button => {
    button.addEventListener('click', () => {
        bookingModal.style.display = 'none';
        messageModal.style.display = 'none';
    });
});

// Form Submission
const bookingForm = document.getElementById('bookingForm');
const messageForm = document.getElementById('messageForm');
const searchForm = document.getElementById('searchForm');

bookingForm.addEventListener('submit', (event) => {
    event.preventDefault();
    // Handle form submission logic here
    console.log('Booking form submitted');

    // Show success message
    const successMessage = document.createElement('div');
    successMessage.textContent = 'Your viewing request has been submitted. The landlord will be in touch soon.';
    successMessage.classList.add('success-message');
    bookingModal.appendChild(successMessage);

    // Close modal after 3 seconds
    setTimeout(() => {
        bookingModal.style.display = 'none';
        successMessage.remove();
    }, 3000);
});

messageForm.addEventListener('submit', (event) => {
    event.preventDefault();
    // Handle form submission logic here
    console.log('Message form submitted');

    // Show success message
    const successMessage = document.createElement('div');
    successMessage.textContent = 'Your message has been sent to the landlord.';
    successMessage.classList.add('success-message');
    messageModal.appendChild(successMessage);

    // Close modal after 3 seconds
    setTimeout(() => {
        messageModal.style.display = 'none';
        successMessage.remove();
    }, 3000);
});

searchForm.addEventListener('submit', (event) => {
    event.preventDefault();
    // Get search form values
    const location = document.getElementById('location').value;
    const propertyType = document.getElementById('propertyType').value;
    const bedrooms = document.getElementById('bedrooms').value;
    const minPrice = document.getElementById('minPrice').value;
    const maxPrice = document.getElementById('maxPrice').value;

    // Filter properties based on search criteria
    filterProperties(location, propertyType, bedrooms, minPrice, maxPrice);
});

// Responsive Navigation
const navLinks = document.querySelector('.nav-links');
const menuIcon = document.createElement('div');
menuIcon.classList.add('menu-icon');
menuIcon.innerHTML = '<i class="fas fa-bars"></i>';
navLinks.parentNode.insertBefore(menuIcon, navLinks);

menuIcon.addEventListener('click', () => {
    navLinks.classList.toggle('responsive');
});

// Property Filtering
const propertyGrid = document.querySelector('.property-grid');

function filterProperties(location, propertyType, bedrooms, minPrice, maxPrice) {
    // Fetch property data from a backend or API
    fetch('/api/properties')
        .then(response => response.json())
        .then(properties => {
            // Filter properties based on search criteria
            const filteredProperties = properties.filter(property => {
                return (
                    (location ? property.location.includes(location) : true) &&
                    (propertyType ? property.type === propertyType : true) &&
                    (bedrooms ? property.bedrooms >= parseInt(bedrooms) : true) &&
                    (minPrice ? property.price >= parseInt(minPrice) : true) &&
                    (maxPrice ? property.price <= parseInt(maxPrice) : true)
                );
            });

            // Clear the property grid
            propertyGrid.innerHTML = '';

            // Render the filtered properties
            filteredProperties.forEach(property => {
                const propertyCard = createPropertyCard(property);
                propertyGrid.appendChild(propertyCard);
            });
        })
        .catch(error => {
            console.error('Error fetching properties:', error);
        });
}

function createPropertyCard(property) {
    // Create the property card element and populate it with the property data
    // ...
    return propertyCard;
}
