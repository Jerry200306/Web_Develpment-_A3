// Admin API Service
angular.module('charityEventsAdmin')
.factory('ApiService', ['$http', '$q', function($http, $q) {
    
    const baseURL = 'http://localhost:3000/api';
    
    return {
        // Health check
        healthCheck: function() {
            return $http.get(`${baseURL}/events/health`);
        },
        
        // Event management
        getAllEvents: function() {
            return $http.get(`${baseURL}/events`);
        },
        
        getEventById: function(eventId) {
            return $http.get(`${baseURL}/events/${eventId}`);
        },
        
        createEvent: function(eventData) {
            return $http.post(`${baseURL}/events`, eventData);
        },
        
        updateEvent: function(eventId, eventData) {
            return $http.put(`${baseURL}/events/${eventId}`, eventData);
        },
        
        deleteEvent: function(eventId) {
            return $http.delete(`${baseURL}/events/${eventId}`);
        },
        
        // Category management
        getCategories: function() {
            return $http.get(`${baseURL}/events/categories`);
        },
        
        // Registration management
        getEventRegistrations: function(eventId) {
            return $http.get(`${baseURL}/events/${eventId}/registrations`);
        },
        
        createRegistration: function(registrationData) {
            return $http.post(`${baseURL}/events/registrations`, registrationData);
        }
    };
}]);