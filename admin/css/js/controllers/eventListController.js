angular.module('charityEventsAdmin')
.controller('EventListController', ['$scope', 'ApiService', '$rootScope', '$location', function($scope, ApiService, $rootScope, $location) {
    $scope.loading = true;
    $scope.events = [];
    
    // Load all events
    $scope.loadEvents = function() {
        $scope.loading = true;
        ApiService.getAllEvents().then(function(response) {
            $scope.events = response.data.data;
            $scope.loading = false;
        }).catch(function(error) {
            console.error('Error loading events:', error);
            $rootScope.showNotification('Failed to load events', 'error');
            $scope.loading = false;
        });
    };
    
    // Edit event
    $scope.editEvent = function(eventId) {
        $location.path('/events/edit/' + eventId);
    };
    
    // Delete event
    $scope.deleteEvent = function(eventId, eventName) {
        if (!confirm(`Are you sure you want to delete "${eventName}"? This action cannot be undone.`)) {
            return;
        }
        
        ApiService.deleteEvent(eventId).then(function(response) {
            $rootScope.showNotification('Event deleted successfully');
            $scope.loadEvents(); // Reload list
        }).catch(function(error) {
            console.error('Error deleting event:', error);
            if (error.status === 400) {
                $rootScope.showNotification('Cannot delete event with existing registrations', 'error');
            } else {
                $rootScope.showNotification('Failed to delete event', 'error');
            }
        });
    };
    
    // View registration information
    $scope.viewRegistrations = function(eventId) {
        $location.path('/events/' + eventId + '/registrations');
    };
    
    // Get event status
    $scope.getEventStatus = function(event) {
        const eventDate = new Date(event.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (eventDate < today) {
            return 'past';
        }
        return 'active';
    };
    
    // Get status text
    $scope.getStatusText = function(event) {
        return $scope.getEventStatus(event) === 'active' ? 'Active' : 'Past';
    };
    
    // Format date
    $scope.formatDate = function(dateString) {
        return new Date(dateString).toLocaleDateString();
    };
    
    // Initial load
    $scope.loadEvents();
}]);