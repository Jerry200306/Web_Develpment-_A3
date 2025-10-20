angular.module('charityEventsAdmin')
.controller('RegistrationsController', ['$scope', 'ApiService', '$rootScope', '$location', '$routeParams', '$q', function($scope, ApiService, $rootScope, $location, $routeParams, $q) {
    $scope.loading = true;
    $scope.event = null;
    $scope.registrations = [];
    
    const eventId = $routeParams.id;
    
    // Load event and registration information
    $scope.loadData = function() {
        $scope.loading = true;
        
        $q.all([
            ApiService.getEventById(eventId),
            ApiService.getEventRegistrations(eventId)
        ]).then(function(responses) {
            $scope.event = responses[0].data.data;
            $scope.registrations = responses[1].data.data;
            $scope.loading = false;
        }).catch(function(error) {
            console.error('Error loading registration data:', error);
            $rootScope.showNotification('Failed to load registration data', 'error');
            $scope.loading = false;
        });
    };
    
    // Return to event list
    $scope.backToEvents = function() {
        $location.path('/events');
    };
    
    // Format date
    $scope.formatDate = function(dateString) {
        return new Date(dateString).toLocaleDateString();
    };
    
    // Get total registrations
    $scope.getTotalRegistrations = function() {
        return $scope.registrations.length;
    };
    
    // Get total tickets
    $scope.getTotalTickets = function() {
        return $scope.registrations.reduce((total, reg) => total + reg.tickets_purchased, 0);
    };
    
    // Initial load
    $scope.loadData();
}]);