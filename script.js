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

bookingForm.addEventListener('submit', (event) => {
    event.preventDefault();
    // Handle form submission logic here
    console.log('Booking form submitted');
    bookingModal.style.display = 'none';
});

messageForm.addEventListener('submit', (event) => {
    event.preventDefault();
    // Handle form submission logic here
    console.log('Message form submitted');
    messageModal.style.display = 'none';
});

// Easter Egg - Hover Animation on Logo
const logo = document.querySelector('.logo');
logo.addEventListener('mouseover', () => {
    logo.classList.add('logo-hover');
});

logo.addEventListener('mouseout', () => {
    logo.classList.remove('logo-hover');
});
