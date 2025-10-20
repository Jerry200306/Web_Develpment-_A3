let categories = [];

document.addEventListener('DOMContentLoaded', function() {
    loadCategories();
    setupEventListeners();
});

async function loadCategories() {
    try {
        categories = await callAPI('/events/categories');  // 现在会调用 /api/events/categories
        populateCategoryDropdown();
    } catch (error) {
        console.error('Failed to load categories:', error);
    }
}

function populateCategoryDropdown() {
    const categorySelect = document.getElementById('category');
    const categoriesHTML = categories.map(cat => 
        `<option value="${cat.id}">${cat.name}</option>`
    ).join('');
    categorySelect.innerHTML = '<option value="">All Categories</option>' + categoriesHTML;
}

function setupEventListeners() {
    const searchForm = document.getElementById('searchForm');
    const clearButton = document.getElementById('clearFilters');

    searchForm.addEventListener('submit', handleSearch);
    clearButton.addEventListener('click', clearFilters);
}

function handleSearch(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const searchParams = new URLSearchParams();
    
    for (const [key, value] of formData.entries()) {
        if (value) {
            searchParams.append(key, value);
        }
    }
    
    performSearch(searchParams);
}

async function performSearch(searchParams) {
    try {
        const allEvents = await callAPI('/events');
        const events = filterEvents(allEvents.data || allEvents, searchParams);
        displaySearchResults(events);
        hideError();
    } catch (error) {
        showError('Failed to search events. Please try again.');
    }
}

function filterEvents(events, searchParams) {
    let filteredEvents = [...events];
    
    const date = searchParams.get('date');
    const location = searchParams.get('location');
    const category = searchParams.get('category');
    
    if (date) {
        filteredEvents = filteredEvents.filter(event => {
            const eventDate = new Date(event.date);
            const localEventDateStr = eventDate.toISOString().split('T')[0];
            
            const localYear = eventDate.getFullYear();
            const localMonth = String(eventDate.getMonth() + 1).padStart(2, '0');
            const localDay = String(eventDate.getDate()).padStart(2, '0');
            const localDateStr = `${localYear}-${localMonth}-${localDay}`;
            
            return localDateStr === date;
        });
    }
    
    if (location) {
        filteredEvents = filteredEvents.filter(event => 
            event.location.toLowerCase().includes(location.toLowerCase())
        );
    }
    
    if (category) {
        filteredEvents = filteredEvents.filter(event => event.category_id == category);
    }
    
    return filteredEvents;
}

function displaySearchResults(events) {
    const resultsContainer = document.getElementById('resultsContainer');
    
    if (!events || events.length === 0) {
        resultsContainer.innerHTML = '<div class="no-results">No events found matching your criteria.</div>';
        return;
    }

    const resultsHTML = events.map(event => `
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

    resultsContainer.innerHTML = resultsHTML;
}

function clearFilters() {
    document.getElementById('searchForm').reset();
    document.getElementById('resultsContainer').innerHTML = 
        '<p class="no-results">Use the form above to search for events</p>';
    hideError();
}

function showError(message) {
    const errorElement = document.getElementById('errorMessage');
    errorElement.textContent = message;
    errorElement.style.display = 'block';
}

function hideError() {
    document.getElementById('errorMessage').style.display = 'none';
}