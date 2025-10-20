angular.module('charityEventsAdmin')
.controller('EventCreateController', ['$scope', 'ApiService', '$rootScope', '$location', function($scope, ApiService, $rootScope, $location) {
    $scope.loading = true;
    $scope.categories = [];
    $scope.submitting = false;
    
    // New event data
    $scope.newEvent = {
        name: '',
        description: '',
        full_description: '',
        category_id: '',
        date: '',
        time: '',
        location: '',
        venue_name: '',
        ticket_price: 0,
        goal_amount: 0,
        image_url: ''
    };
    
    // Safe string processing function
    $scope.safeTrim = function(str) {
        return (str && typeof str === 'string') ? str.trim() : '';
    };
    
    // Check if date is valid
    $scope.isValidDate = function(dateValue) {
        if (!dateValue) return false;
        
        try {
            if (typeof dateValue === 'string') {
                return dateValue.match(/^\d{4}-\d{2}-\d{2}$/) !== null;
            } else if (dateValue instanceof Date) {
                return !isNaN(dateValue.getTime());
            }
            return false;
        } catch (error) {
            return false;
        }
    };
    
    // Load categories
    ApiService.getCategories().then(function(response) {
        $scope.categories = response.data.data;
        $scope.loading = false;
    }).catch(function(error) {
        console.error('Error loading categories:', error);
        $rootScope.showNotification('Failed to load categories', 'error');
        $scope.loading = false;
    });
    
    // Form validation
    $scope.isFormValid = function() {
        const requiredFields = {
            'name': 'Event name',
            'description': 'Short description', 
            'category_id': 'Category',
            'date': 'Date',
            'location': 'Location'
        };
        
        for (let field in requiredFields) {
            if (!$scope.newEvent[field]) {
                $rootScope.showNotification(`Please fill in ${requiredFields[field]}`, 'error');
                return false;
            }
        }
        
        if (!$scope.isValidDate($scope.newEvent.date)) {
            $rootScope.showNotification('Date format must be YYYY-MM-DD', 'error');
            return false;
        }
        
        return true;
    };
    
    // Data preparation
    $scope.prepareDataForSubmit = function() {
        const data = {
            name: $scope.safeTrim($scope.newEvent.name),
            description: $scope.safeTrim($scope.newEvent.description),
            full_description: $scope.safeTrim($scope.newEvent.full_description),
            category_id: parseInt($scope.newEvent.category_id) || 1,
            date: '',
            location: $scope.safeTrim($scope.newEvent.location),
            venue_name: $scope.safeTrim($scope.newEvent.venue_name),
            ticket_price: parseFloat($scope.newEvent.ticket_price) || 0,
            goal_amount: parseFloat($scope.newEvent.goal_amount) || 0,
            image_url: $scope.safeTrim($scope.newEvent.image_url) || null,
            organization_id: 1
        };
        
        // Process date
        let dateValue = $scope.newEvent.date;
        if (dateValue) {
            if (typeof dateValue === 'string' && dateValue.match(/^\d{4}-\d{2}-\d{2}$/)) {
                data.date = dateValue;
            } else if (dateValue instanceof Date) {
                data.date = dateValue.toISOString().split('T')[0];
            } else {
                try {
                    const date = new Date(dateValue);
                    if (!isNaN(date.getTime())) {
                        data.date = date.toISOString().split('T')[0];
                    }
                } catch (error) {
                    data.date = '';
                }
            }
        }
        
        // Process time
        let timeValue = $scope.newEvent.time;
        if (timeValue && typeof timeValue === 'string' && timeValue.trim()) {
            const trimmedTime = timeValue.trim();
            if (trimmedTime.match(/^\d{1,2}:\d{2}$/)) {
                data.time = trimmedTime;
            } else {
                data.time = null;
            }
        } else {
            data.time = null;
        }
        
        return data;
    };
    
    // Create event
    $scope.createEvent = function() {
        if (!$scope.isFormValid()) {
            return;
        }
        
        $scope.submitting = true;
        
        const eventData = $scope.prepareDataForSubmit();
        
        ApiService.createEvent(eventData).then(function(response) {
            $rootScope.showNotification('Event created successfully!');
            $location.path('/events');
        }).catch(function(error) {
            console.error('Error creating event:', error);
            
            let errorMsg = 'Failed to create event';
            if (error.data && error.data.message) {
                errorMsg += ': ' + error.data.message;
            } else if (error.status === 400) {
                errorMsg += ': Data format error';
            } else if (error.status === 500) {
                errorMsg += ': Server error';
            }
            
            $rootScope.showNotification(errorMsg, 'error');
        }).finally(function() {
            $scope.submitting = false;
        });
    };
    
    // Cancel creation
    $scope.cancelCreate = function() {
        $location.path('/events');
    };
}]);