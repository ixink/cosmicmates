// script.js

// Get modal element
const modal = document.getElementById('questionModal');

// Get buttons
const yesBtn = document.getElementById('yesBtn');
const noBtn = document.getElementById('noBtn');
const thinkBtn = document.getElementById('thinkBtn');

// Function to open modal
function openModal() {
    modal.style.display = 'flex';
}

// Function to close modal
function closeModal() {
    modal.style.display = 'none';
}

// Add click event to all exoplanets
const exoplanets = document.querySelectorAll('.exoplanet');
exoplanets.forEach(exoplanet => {
    exoplanet.addEventListener('click', () => {
        openModal();
    });
});

// Handle button clicks
yesBtn.addEventListener('click', () => {
    closeModal();
    window.location.href = 'chatroom.html';
});

noBtn.addEventListener('click', () => {
    closeModal();
    alert('Thank you for your response!');
});

thinkBtn.addEventListener('click', () => {
    closeModal();
    alert('Take your time to think!');
});

// Close modal when clicking outside the modal content
window.addEventListener('click', (e) => {
    if (e.target == modal) {
        closeModal();
    }
});
