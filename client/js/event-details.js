document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get('id');
    
    if (eventId) {
        loadEventDetails(eventId);
    } else {
        showError('No event ID provided.');
    }
});

async function loadEventDetails(eventId) {
    try {
        console.log(`Loading details for event ID: ${eventId}`);
        
        // Fix: Use correct API endpoint
        const response = await fetch(`${API_BASE_URL}/events/${eventId}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('API Response:', result);
        
        // Handle different response formats
        let eventData;
        if (result.success !== undefined) {
            // Format: {success: true, data: {...}}
            eventData = result.data;
        } else if (Array.isArray(result)) {
            // Format: [{...}] - take first one
            eventData = result[0];
        } else {
            // Format: {...} - use directly
            eventData = result;
        }
        
        if (!eventData) {
            throw new Error('Event data not found in response');
        }
        
        // Try to get registration data
        let registrations = [];
        try {
            // Fix: Use correct registration data endpoint
            const regResponse = await fetch(`${API_BASE_URL}/events/${eventId}/registrations`);
            if (regResponse.ok) {
                const regResult = await regResponse.json();
                registrations = Array.isArray(regResult) ? regResult : 
                              (regResult.data || regResult.registrations || []);
            }
        } catch (regError) {
            console.log('No registrations endpoint available:', regError.message);
        }
        
        displayEventDetails(eventData, registrations);
        
    } catch (error) {
        console.error('Error loading event details:', error);
        showError(`Failed to load event details: ${error.message}`);
        
        // Try alternative method: find from all events
        try {
            console.log('Trying alternative method...');
            await loadEventAlternative(eventId);
        } catch (altError) {
            console.error('Alternative method also failed:', altError);
        }
    }
}

async function loadEventAlternative(eventId) {
    try {
        // Fix: Use correct events list endpoint
        const response = await fetch(`${API_BASE_URL}/events`);
        if (!response.ok) throw new Error('Failed to fetch all events');
        
        const result = await response.json();
        const allEvents = Array.isArray(result) ? result : (result.data || result.events || []);
        
        const event = allEvents.find(e => e.id == eventId || e.event_id == eventId);
        if (!event) {
            throw new Error(`Event with ID ${eventId} not found`);
        }
        
        displayEventDetails(event, []);
        
    } catch (error) {
        throw error;
    }
}

function displayEventDetails(event, registrations) {
    const loadingElement = document.getElementById('loading');
    const detailsElement = document.getElementById('eventDetails');
    
    loadingElement.style.display = 'none';
    
    const currentAmount = event.current_amount || 0;
    const goalAmount = event.goal_amount || 0;
    const progressPercentage = goalAmount ? 
        Math.min((currentAmount / goalAmount) * 100, 100) : 0;
    
    // Sort registration records by date (newest first)
    const sortedRegistrations = registrations
        .filter(reg => reg && typeof reg === 'object')
        .sort((a, b) => {
            const dateA = new Date(a.registration_date || a.date);
            const dateB = new Date(b.registration_date || b.date);
            return dateB - dateA;
        });
    
    detailsElement.innerHTML = `
        <div class="event-detail-card">
            <div class="event-header">
                <div>
                    <span class="event-category">${event.category_name || 'General'}</span>
                    <h1>${event.name}</h1>
                    <p class="event-description">${event.description}</p>
                </div>
                <div class="event-image-large">
                    ${getImageUrl(event.image_url) ? 
                        `<img src="${getImageUrl(event.image_url)}" alt="${event.name}" 
                             onerror="this.src='images/placeholder.jpg'; this.alt='Image not available'"
                             style="width:100%;height:100%;object-fit:cover;border-radius:8px;">` : 
                        '<div class="image-placeholder-large">Event Image</div>'
                    }
                </div>
            </div>
            
            <div class="event-info-sidebar">
                <h3>Event Information</h3>
                <p><strong>Date:</strong> ${event.date ? formatDate(event.date) : 'Date not set'}</p>
                <p><strong>Time:</strong> ${event.time || 'TBA'}</p>
                <p><strong>Location:</strong> ${event.location || 'Location not specified'}</p>
                <p><strong>Ticket Price:</strong> ${event.ticket_price ? formatCurrency(event.ticket_price) : 'Free'}</p>
                <p><strong>Organizer:</strong> ${event.organization_name || 'HopeConnect'}</p>
                
                <!-- Fix: Ensure eventId is correctly passed -->
                <a href="registration.html?eventId=${event.id || event.event_id}" class="btn-primary" style="display:block;text-align:center;text-decoration:none;margin-top:1rem;padding:0.75rem;">
                    Register for Event
                </a>
            </div>
            
            ${event.goal_amount ? `
            <div class="progress-container">
                <h3>Fundraising Progress</h3>
                <p>Goal: ${formatCurrency(event.goal_amount)}</p>
                <p>Raised: ${formatCurrency(event.current_amount || 0)}</p>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progressPercentage}%"></div>
                </div>
                <p>${progressPercentage.toFixed(1)}% of goal reached</p>
            </div>
            ` : ''}
            
            <!-- Display registration list -->
            <div class="registrations-section">
                <h3>Recent Registrations (${sortedRegistrations.length})</h3>
                ${sortedRegistrations.length > 0 ? `
                    <div class="registrations-list">
                        ${sortedRegistrations.map(reg => `
                            <div class="registration-item">
                                <div class="registration-info">
                                    <strong>${reg.user_name || reg.name || 'Anonymous'}</strong>
                                    <span>${reg.tickets_purchased || reg.tickets || 1} ticket(s)</span>
                                </div>
                                <div class="registration-date">
                                    ${formatDate(reg.registration_date || reg.date)}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                ` : `
                    <p class="no-registrations">No registrations yet. Be the first to register!</p>
                `}
            </div>
            
            <div class="event-full-description">
                <h3>About This Event</h3>
                <p>${event.full_description || event.description || 'More details coming soon.'}</p>
            </div>
        </div>
    `;
    
    detailsElement.style.display = 'block';
}

function showError(message) {
    const errorContainer = document.getElementById('errorContainer');
    const loadingElement = document.getElementById('loading');
    
    loadingElement.style.display = 'none';
    errorContainer.textContent = message;
    errorContainer.style.display = 'block';
    
    console.error('Error:', message);
}