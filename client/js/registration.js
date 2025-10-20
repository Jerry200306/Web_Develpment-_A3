let currentEvent = null;
let currentEventId = null;

document.addEventListener('DOMContentLoaded', function() {
    console.log('Registration page loaded');
    
    // Get event ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    currentEventId = urlParams.get('eventId');
    
    console.log('Event ID from URL:', currentEventId);
    
    // If no eventId, try to get from other sources
    if (!currentEventId) {
        console.log('No eventId in URL, checking alternative sources...');
        
        // Try to get from sessionStorage (if redirected from event page)
        const storedEventId = sessionStorage.getItem('currentEventId');
        if (storedEventId) {
            currentEventId = storedEventId;
            console.log('Found eventId in sessionStorage:', currentEventId);
        }
        
        // If still not found, show error with return links
        if (!currentEventId) {
            showErrorWithLink();
            return;
        }
    }
    
    // Save eventId to sessionStorage for future use
    sessionStorage.setItem('currentEventId', currentEventId);
    
    loadEventInfo(currentEventId);
    setupFormHandlers();
});

function showErrorWithLink() {
    const loadingElement = document.getElementById('loading');
    const errorContainer = document.getElementById('errorContainer');
    
    if (loadingElement) {
        loadingElement.style.display = 'none';
    }
    
    if (errorContainer) {
        errorContainer.innerHTML = `
            <div style="text-align: center; padding: 2rem;">
                <h3>No Event Specified</h3>
                <p>Please select an event to register from the events page.</p>
                <div style="margin-top: 1.5rem;">
                    <a href="index.html" class="btn-primary" style="margin-right: 1rem;">Browse Events</a>
                    <a href="search.html" class="btn-secondary">Search Events</a>
                </div>
            </div>
        `;
        errorContainer.style.display = 'block';
    }
}

async function loadEventInfo(eventId) {
    try {
        console.log(`Loading event info for ID: ${eventId}`);
        
        // First try to call API directly
        const response = await fetch(`${API_BASE_URL}/events/${eventId}`);
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('Event API Response:', result);
        
        if (!result.success) {
            throw new Error(result.message || 'Failed to load event');
        }
        
        currentEvent = result.data;
        console.log('Processed event data:', currentEvent);
        
        if (!currentEvent) {
            throw new Error('Event data not found in response');
        }
        
        displayEventInfo(currentEvent);
        
    } catch (error) {
        console.error('Error loading event info:', error);
        
        // Try alternative method: find from all events
        try {
            console.log('Trying alternative method to find event...');
            await loadEventAlternative(eventId);
        } catch (altError) {
            console.error('Alternative method also failed:', altError);
            showError(`Failed to load event information: ${error.message}`);
        }
    }
}

// Alternative method: find from all events
async function loadEventAlternative(eventId) {
    try {
        const response = await fetch(`${API_BASE_URL}/`);
        if (!response.ok) throw new Error('Failed to fetch all events');
        
        const result = await response.json();
        const allEvents = result.data || result;
        
        // Find matching event
        const event = Array.isArray(allEvents) ? 
            allEvents.find(e => e.id == eventId || e.event_id == eventId) : null;
        
        if (!event) {
            throw new Error(`Event with ID ${eventId} not found`);
        }
        
        currentEvent = event;
        displayEventInfo(currentEvent);
        
    } catch (error) {
        throw error;
    }
}

// Other functions remain unchanged...
function displayEventInfo(event) {
    const loadingElement = document.getElementById('loading');
    const contentElement = document.getElementById('registrationContent');
    const eventInfoElement = document.getElementById('eventInfo');
    
    if (!loadingElement || !contentElement || !eventInfoElement) {
        console.error('Required DOM elements not found');
        showError('Page layout error. Please refresh the page.');
        return;
    }
    
    loadingElement.style.display = 'none';
    
    // Safely access properties
    const eventName = event.name || event.event_name || 'Unnamed Event';
    const eventDate = event.date || event.event_date;
    const eventLocation = event.location || event.event_location || 'Location not specified';
    const eventTime = event.time || event.event_time || 'TBA';
    const ticketPrice = event.ticket_price || event.price;
    const imageUrl = event.image_url || event.image;
    
    eventInfoElement.innerHTML = `
        <div class="event-header">
            <div class="event-image-medium">
                ${getImageUrl(imageUrl) ? 
                    `<img src="${getImageUrl(imageUrl)}" alt="${eventName}" 
                         onerror="this.src='images/placeholder.jpg'; this.alt='Image not available'">` : 
                    '<div class="image-placeholder-medium">Event Image</div>'
                }
            </div>
            <div class="event-details">
                <h1>${eventName}</h1>
                <div class="event-meta">
                    <p>📅 <strong>Date:</strong> ${eventDate ? formatDate(eventDate) : 'Date not set'}</p>
                    <p>⏰ <strong>Time:</strong> ${eventTime}</p>
                    <p>📍 <strong>Location:</strong> ${eventLocation}</p>
                    <p>💰 <strong>Ticket Price:</strong> ${ticketPrice ? formatCurrency(ticketPrice) : 'Free'}</p>
                </div>
            </div>
        </div>
    `;
    
    contentElement.style.display = 'block';
}

// setupFormHandlers, handleFormSubmit and other functions remain unchanged...

function setupFormHandlers() {
    const form = document.getElementById('registrationForm');
    const ticketsSelect = document.getElementById('tickets');
    const customTicketsGroup = document.getElementById('customTicketsGroup');
    
    if (!form || !ticketsSelect) {
        console.error('Form elements not found');
        return;
    }
    
    // Handle ticket quantity selection change
    ticketsSelect.addEventListener('change', function() {
        if (this.value === '6') {
            customTicketsGroup.style.display = 'block';
            document.getElementById('customTickets').required = true;
        } else {
            customTicketsGroup.style.display = 'none';
            document.getElementById('customTickets').required = false;
        }
    });
    
    // Form submission handling
    form.addEventListener('submit', handleFormSubmit);
}

async function handleFormSubmit(event) {
    event.preventDefault();
    console.log('Form submitted');
    
    if (!validateForm()) {
        return;
    }
    
    const submitBtn = document.getElementById('submitBtn');
    const originalText = submitBtn.textContent;
    
    try {
        // Disable submit button and show loading state
        submitBtn.disabled = true;
        submitBtn.textContent = 'Processing...';
        
        // Get form data
        const formData = getFormData();
        
        console.log('Submitting registration:', formData);
        
        // Call API to submit registration - first use mock success
        await submitRegistration(formData);
        
        // Show success message
        showSuccessMessage(formData);
        
    } catch (error) {
        console.error('Registration error:', error);
        showError(`Registration failed: ${error.message}`);
        
        // Re-enable submit button
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
}

// Replace original mock function
async function submitRegistration(formData) {
    const response = await fetch(`${API_BASE_URL}/events/registrations`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
    });
    
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Registration failed: ${errorText}`);
    }
    
    const result = await response.json();
    
    if (!result.success) {
        throw new Error(result.message || 'Registration failed');
    }
    
    return result;
}

function getFormData() {
    const ticketsSelect = document.getElementById('tickets');
    let ticketsPurchased;
    
    if (ticketsSelect.value === '6') {
        ticketsPurchased = parseInt(document.getElementById('customTickets').value) || 0;
    } else {
        ticketsPurchased = parseInt(ticketsSelect.value) || 1;
    }
    
    return {
        event_id: parseInt(currentEventId),
        user_name: document.getElementById('userName').value.trim(),
        email: document.getElementById('email').value.trim(),
        phone: document.getElementById('phone').value.trim() || null,
        tickets_purchased: ticketsPurchased,
        comments: document.getElementById('comments').value.trim() || null,
        registration_date: new Date().toISOString().split('T')[0]
    };
}

function validateForm() {
    let isValid = true;
    
    // Clear previous error messages
    clearErrors();
    
    // Validate name
    const userName = document.getElementById('userName').value.trim();
    if (!userName) {
        showFieldError('nameError', 'Please enter your full name');
        isValid = false;
    }
    
    // Validate email
    const email = document.getElementById('email').value.trim();
    if (!email) {
        showFieldError('emailError', 'Please enter your email address');
        isValid = false;
    } else if (!isValidEmail(email)) {
        showFieldError('emailError', 'Please enter a valid email address');
        isValid = false;
    }
    
    // Validate ticket quantity
    const ticketsSelect = document.getElementById('tickets');
    if (!ticketsSelect.value) {
        showFieldError('ticketsError', 'Please select number of tickets');
        isValid = false;
    } else if (ticketsSelect.value === '6') {
        const customTickets = document.getElementById('customTickets').value;
        if (!customTickets) {
            showFieldError('customTicketsError', 'Please enter number of tickets');
            isValid = false;
        } else if (customTickets < 7 || customTickets > 20) {
            showFieldError('customTicketsError', 'Please enter between 7 and 20 tickets');
            isValid = false;
        }
    }
    
    return isValid;
}

function clearErrors() {
    const errorElements = document.querySelectorAll('.error-message');
    errorElements.forEach(element => {
        element.textContent = '';
        element.previousElementSibling?.classList.remove('error');
    });
}

function showFieldError(elementId, message) {
    const element = document.getElementById(elementId);
    const inputElement = document.getElementById(elementId.replace('Error', ''));
    
    if (element) {
        element.textContent = message;
    }
    if (inputElement) {
        inputElement.classList.add('error');
    }
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showSuccessMessage(formData) {
    const contentElement = document.getElementById('registrationContent');
    const successElement = document.getElementById('successMessage');
    const successDetails = document.getElementById('successDetails');
    
    if (!contentElement || !successElement || !successDetails) {
        console.error('Success message elements not found');
        return;
    }
    
    contentElement.style.display = 'none';
    
    const eventName = currentEvent?.name || currentEvent?.event_name || 'the event';
    const ticketPrice = currentEvent?.ticket_price || currentEvent?.price || 0;
    const totalAmount = ticketPrice * formData.tickets_purchased;
    
    successDetails.innerHTML = `
        <div class="registration-summary">
            <h3>Registration Details</h3>
            <p><strong>Event:</strong> ${eventName}</p>
            <p><strong>Name:</strong> ${formData.user_name}</p>
            <p><strong>Email:</strong> ${formData.email}</p>
            <p><strong>Tickets:</strong> ${formData.tickets_purchased}</p>
            <p><strong>Total Amount:</strong> ${formatCurrency(totalAmount)}</p>
            <p><strong>Registration Date:</strong> ${formatDate(new Date().toISOString())}</p>
        </div>
    `;
    
    successElement.style.display = 'block';
}

function goBack() {
    window.history.back();
}

function goToHome() {
    window.location.href = 'index.html';
}

function goToEvent() {
    if (currentEventId) {
        window.location.href = `event-details.html?id=${currentEventId}`;
    } else {
        window.location.href = 'index.html';
    }
}

function showError(message) {
    const errorContainer = document.getElementById('errorContainer');
    const loadingElement = document.getElementById('loading');
    
    if (loadingElement) {
        loadingElement.style.display = 'none';
    }
    
    if (errorContainer) {
        errorContainer.textContent = message;
        errorContainer.style.display = 'block';
    } else {
        alert('Error: ' + message);
    }
}

// Ensure these functions are globally available
window.goBack = goBack;
window.goToHome = goToHome;
window.goToEvent = goToEvent;