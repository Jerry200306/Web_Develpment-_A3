document.addEventListener('DOMContentLoaded', function() {
    loadEvents();
});

async function loadEvents() {
    try {
        console.log('Loading events from API...');
        
        const eventsData = await callAPI('/events');
        console.log('Events data received:', eventsData);

        const events = eventsData.data || eventsData;
        console.log('Processed events count:', events.length); // 🔥 添加数量检查
        console.log('All events:', events.map(e => ({ id: e.id, name: e.name, image_url: e.image_url }))); // 🔥 详细日志
        
        displayEvents(events);
    } catch (error) {
        console.error('Error loading events:', error);
        document.getElementById('eventsGrid').innerHTML = 
            '<div class="error-message">Failed to load events. Please try again later.</div>';
    }
}

function displayEvents(events) {
    const eventsGrid = document.getElementById('eventsGrid');
    
    if (!events || events.length === 0) {
        eventsGrid.innerHTML = '<div class="no-results">No upcoming events found.</div>';
        return;
    }

    const eventsHTML = events.map(event => `
        <div class="event-card">
            <div class="event-image">
                ${getImageUrl(event.image_url) ? 
                    `<img src="${getImageUrl(event.image_url)}" alt="${event.name}" 
                         onerror="this.src='images/placeholder.jpg'; this.alt='Image not available'"
                         style="width:100%;height:100%;object-fit:cover;">` : 
                    '<div class="image-placeholder">Event Image</div>'
                }
            </div>
            <div class="event-content">
                <span class="event-category">${event.category_name || 'General'}</span>
                <h3 class="event-title">${event.name}</h3>
                <div class="event-meta">
                    <p>📅 ${formatDate(event.date)}</p>
                    <p>📍 ${event.location}</p>
                    <p>💰 ${event.ticket_price ? formatCurrency(event.ticket_price) : 'Free'}</p>
                </div>
                <a href="event-details.html?id=${event.id}" class="event-link">View Details</a>
            </div>
        </div>
    `).join('');

    eventsGrid.innerHTML = eventsHTML;
}