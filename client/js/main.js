const IMAGE_BASE_URL = 'http://localhost:3000';
// Fix API_BASE_URL configuration
const API_BASE_URL = 'http://localhost:3000/api';

// Or safer configuration method
function getApiBaseUrl() {
    // If file protocol, use full URL
    if (window.location.protocol === 'file:') {
        return 'http://localhost:3000/api';
    }
    // If http protocol, use relative path
    return '/api';
}


const EVENTS_API_URL = `${API_BASE_URL}/events`;

// Set to global for use by other files
window.API_BASE_URL = API_BASE_URL;
window.EVENTS_API_URL = EVENTS_API_URL;

// Debug mode
const DEBUG = true;

function logDebug(...args) {
    if (DEBUG) {
        console.log('[DEBUG]', ...args);
    }
}

function getImageUrl(imagePath) {
    const baseUrl = 'http://localhost:3000';
    
    if (!imagePath) {
        // 🔥 Fix: Return default image or random image, not fixed image
        const randomImage = Math.floor(Math.random() * 10) + 1; // Random image 1-10
        return `${baseUrl}/images/events/${randomImage}.jpg`;
    }
    
    if (imagePath.startsWith('http')) {
        return imagePath;
    }
    
    // Ensure correct path
    if (imagePath.startsWith('/images/')) {
        return `${baseUrl}${imagePath}`;
    }
    
    if (imagePath.startsWith('images/')) {
        return `${baseUrl}/${imagePath}`;
    }
    
    // Default add to events folder
    return `${baseUrl}/images/events/${imagePath}`;
}

async function callAPI(endpoint, options = {}) {
    try {
        logDebug(`Calling API: ${API_BASE_URL}${endpoint}`, options);
        
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });

        logDebug(`Response status: ${response.status}`);
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        logDebug('API response data:', data);
        
        if (data.success === false) {
            throw new Error(data.message || 'API request failed');
        }

        return data.data || data;
    } catch (error) {
        console.error('API call failed:', error);
        throw error;
    }
}

function setupModal() {
    const modal = document.getElementById('registerModal');
    if (!modal) return;
    
    const closeBtn = modal.querySelector('.close');
    const okBtn = document.getElementById('modalOk');

    function closeModal() {
        modal.style.display = 'none';
    }

    window.showRegisterModal = function() {
        modal.style.display = 'block';
    };

    if (closeBtn) closeBtn.onclick = closeModal;
    if (okBtn) okBtn.onclick = closeModal;

    window.onclick = function(event) {
        if (event.target === modal) {
            closeModal();
        }
    };
}

document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('registerModal')) {
        setupModal();
    }
});

function formatDate(dateString) {
    if (!dateString) return 'Date not set';
    
    try {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-AU', options);
    } catch (error) {
        return 'Invalid date';
    }
}

function formatCurrency(amount) {
    if (amount === null || amount === undefined) return 'Free';
    
    return new Intl.NumberFormat('en-AU', {
        style: 'currency',
        currency: 'AUD'
    }).format(amount);
}

// New: Generic function to display error messages
function showGlobalError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message global-error';
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        padding: 1rem;
        background: #e74c3c;
        color: white;
        border-radius: 4px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    `;
    
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}