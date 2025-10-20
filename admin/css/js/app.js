// Admin AngularJS Application
angular.module('charityEventsAdmin', ['ngRoute'])
.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
    
    $locationProvider.hashPrefix('');
    
    $routeProvider
    .when('/events', {
        templateUrl: 'pages/event-list.html',
        controller: 'EventListController'
    })
    .when('/events/create', {
        templateUrl: 'pages/event-create.html',
        controller: 'EventCreateController'
    })
    .when('/events/edit/:id', {
        templateUrl: 'pages/event-edit.html',
        controller: 'EventEditController'
    })
    .when('/events/:id/registrations', {
        templateUrl: 'pages/registrations.html',
        controller: 'RegistrationsController'
    })
    .otherwise({
        redirectTo: '/events'
    });
}])
.run(['$rootScope', 'ApiService', function($rootScope, ApiService) {
    // Initialize application
    $rootScope.app = {
        name: 'Charity Events Admin',
        version: '1.0.0'
    };
    
    // Global notification system
    $rootScope.notification = {
        show: false,
        message: '',
        type: 'success'
    };
    
    $rootScope.showNotification = function(message, type = 'success') {
        $rootScope.notification = {
            show: true,
            message: message,
            type: type
        };
        
        // Auto hide after 5 seconds
        setTimeout(function() {
            $rootScope.$apply(function() {
                $rootScope.notification.show = false;
            });
        }, 5000);
    };
    
    // Health check
    ApiService.healthCheck().then(function(response) {
        console.log('Admin API Health:', response.data);
    }).catch(function(error) {
        console.error('Admin API Health Check Failed:', error);
        $rootScope.showNotification('API connection failed', 'error');
    });
}]);