angular.module('charityEventsAdmin')
.controller('EventEditController', ['$scope', 'ApiService', '$rootScope', '$location', '$routeParams', '$q', function($scope, ApiService, $rootScope, $location, $routeParams, $q) {
    $scope.loading = true;
    $scope.categories = [];
    $scope.event = null;
    $scope.submitting = false;
    
    const eventId = $routeParams.id;
    
    // Safe string processing function
    $scope.safeTrim = function(str) {
        return (str && typeof str === 'string') ? str.trim() : '';
    };
    
    // Simple time processing function
    $scope.simpleTimeFormat = function(timeString) {
        if (!timeString) return '';
        
        try {
            const timeStr = timeString.toString().trim();
            
            // If already in HH:mm format, return directly
            if (timeStr.match(/^\d{1,2}:\d{2}$/)) {
                return timeStr;
            }
            
            // If contains colon, take first 5 characters (HH:mm)
            if (timeStr.includes(':')) {
                return timeStr.substring(0, 5);
            }
            
            // If pure numbers, try to format as HH:mm
            if (timeStr.match(/^\d+$/)) {
                const num = parseInt(timeStr);
                if (num >= 0 && num <= 2359) {
                    const hours = Math.floor(num / 100);
                    const minutes = num % 100;
                    if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
                        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
                    }
                }
            }
            
            // Other cases return empty string
            return '';
        } catch (error) {
            console.warn('Time format error, using empty string:', error);
            return '';
        }
    };
    
    // Simple date processing function
    $scope.simpleDateFormat = function(dateString) {
        if (!dateString) return '';
        
        try {
            // If already in YYYY-MM-DD format, return directly
            if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
                return dateString;
            }
            
            // Try to parse as Date object
            const date = new Date(dateString);
            if (!isNaN(date.getTime())) {
                return date.toISOString().split('T')[0];
            }
            
            return '';
        } catch (error) {
            console.warn('Date format error, using empty string:', error);
            return '';
        }
    };
    
    // Check if date is valid
    $scope.isValidDate = function(dateValue) {
        if (!dateValue) return false;
        
        try {
            if (typeof dateValue === 'string') {
                // If string, check format
                return dateValue.match(/^\d{4}-\d{2}-\d{2}$/) !== null;
            } else if (dateValue instanceof Date) {
                // If Date object, check if valid
                return !isNaN(dateValue.getTime());
            }
            return false;
        } catch (error) {
            console.warn('Date validation error:', error);
            return false;
        }
    };
    
    // Load event data and categories
    $scope.loadEventData = function() {
        $scope.loading = true;
        
        $q.all([
            ApiService.getEventById(eventId),
            ApiService.getCategories()
        ]).then(function(responses) {
            $scope.event = responses[0].data.data;
            $scope.categories = responses[1].data.data;
            
            console.log('Raw event data:', $scope.event);
            
            // Enhanced formatting processing
            if ($scope.event.date) {
                // Ensure date is in YYYY-MM-DD format
                if ($scope.event.date instanceof Date) {
                    $scope.event.date = $scope.event.date.toISOString().split('T')[0];
                } else if (typeof $scope.event.date === 'string') {
                    // If contains time part, take only date part
                    if ($scope.event.date.includes('T')) {
                        $scope.event.date = $scope.event.date.split('T')[0];
                    }
                    // Ensure correct format
                    $scope.event.date = $scope.simpleDateFormat($scope.event.date);
                }
            }
            
            $scope.event.time = $scope.simpleTimeFormat($scope.event.time);
            
            // Numeric field processing
            $scope.event.ticket_price = parseFloat($scope.event.ticket_price) || 0;
            $scope.event.goal_amount = parseFloat($scope.event.goal_amount) || 0;
            $scope.event.category_id = parseInt($scope.event.category_id) || '';
            
            // Ensure all fields have values
            $scope.event.name = $scope.safeTrim($scope.event.name);
            $scope.event.description = $scope.safeTrim($scope.event.description);
            $scope.event.full_description = $scope.safeTrim($scope.event.full_description);
            $scope.event.location = $scope.safeTrim($scope.event.location);
            $scope.event.venue_name = $scope.safeTrim($scope.event.venue_name);
            $scope.event.image_url = $scope.safeTrim($scope.event.image_url);
            
            console.log('Formatted event data:', $scope.event);
            
            $scope.loading = false;
            
            // Delay setting form state to ensure DOM is rendered
            setTimeout(function() {
                if ($scope.eventForm) {
                    $scope.eventForm.$setPristine();
                    $scope.eventForm.$setUntouched();
                }
            }, 100);
            
        }).catch(function(error) {
            console.error('Failed to load event data:', error);
            $rootScope.showNotification('Failed to load event data', 'error');
            $scope.loading = false;
        });
    };
    
    // Simple form validation
    $scope.isFormValid = function() {
        if (!$scope.event) return false;
        
        // Basic required field check
        const requiredFields = {
            'name': 'Event name',
            'description': 'Short description', 
            'category_id': 'Category',
            'date': 'Date',
            'location': 'Location'
        };
        
        for (let field in requiredFields) {
            if (!$scope.event[field]) {
                $rootScope.showNotification(`Please fill in ${requiredFields[field]}`, 'error');
                return false;
            }
        }
        
        // Validate date format - fixed version
        if (!$scope.isValidDate($scope.event.date)) {
            $rootScope.showNotification('Date format must be YYYY-MM-DD', 'error');
            return false;
        }
        
        return true;
    };
    
    // Simple data preparation - fixed version
    $scope.prepareDataForSubmit = function() {
        const data = {
            name: $scope.safeTrim($scope.event.name),
            description: $scope.safeTrim($scope.event.description),
            full_description: $scope.safeTrim($scope.event.full_description),
            category_id: parseInt($scope.event.category_id) || 1,
            date: '', // Set empty first, will process specifically below
            location: $scope.safeTrim($scope.event.location),
            venue_name: $scope.safeTrim($scope.event.venue_name),
            ticket_price: parseFloat($scope.event.ticket_price) || 0,
            goal_amount: parseFloat($scope.event.goal_amount) || 0,
            image_url: $scope.safeTrim($scope.event.image_url) || null,
            organization_id: $scope.event.organization_id || 1
        };
        
        // Safe processing of date field - fixed version
        let dateValue = $scope.event.date;
        if (dateValue) {
            if (typeof dateValue === 'string' && dateValue.match(/^\d{4}-\d{2}-\d{2}$/)) {
                // If already correct string format, use directly
                data.date = dateValue;
            } else if (dateValue instanceof Date) {
                // If Date object, format as YYYY-MM-DD
                data.date = dateValue.toISOString().split('T')[0];
            } else {
                // Try to parse other formats
                try {
                    const date = new Date(dateValue);
                    if (!isNaN(date.getTime())) {
                        data.date = date.toISOString().split('T')[0];
                    }
                } catch (error) {
                    console.warn('Date parsing error:', error);
                    data.date = '';
                }
            }
        } else {
            data.date = '';
        }
        
        // Safe processing of time field
        let timeValue = $scope.event.time;
        if (timeValue && typeof timeValue === 'string' && timeValue.trim()) {
            const trimmedTime = timeValue.trim();
            // Ensure correct time format
            if (trimmedTime.match(/^\d{1,2}:\d{2}$/)) {
                data.time = trimmedTime + ':00';
            } else {
                // If format incorrect, set to null
                data.time = null;
            }
        } else {
            data.time = null;
        }
        
        console.log('Data ready for submission:', data);
        return data;
    };
    
    // Update event - fixed version
    $scope.updateEvent = function() {
        console.log('Starting event update...');
        
        // Basic validation
        if (!$scope.isFormValid()) {
            return;
        }
        
        $scope.submitting = true;
        
        // Prepare data
        const updateData = $scope.prepareDataForSubmit();
        console.log('Submitting data:', updateData);
        
        // API call
        ApiService.updateEvent(eventId, updateData)
            .then(function(response) {
                console.log('Update successful:', response);
                $rootScope.showNotification('Event updated successfully!');
                $location.path('/events');
            })
            .catch(function(error) {
                console.error('Update failed:', error);
                
                let errorMsg = 'Failed to update event';
                if (error.data && error.data.message) {
                    errorMsg += ': ' + error.data.message;
                } else if (error.status === 400) {
                    errorMsg += ': Data format error';
                } else if (error.status === 404) {
                    errorMsg += ': Event does not exist';
                } else if (error.status === 500) {
                    errorMsg += ': Server error';
                }
                
                $rootScope.showNotification(errorMsg, 'error');
            })
            .finally(function() {
                $scope.submitting = false;
            });
    };
    
    // Cancel editing
    $scope.cancelEdit = function() {
        if ($scope.eventForm && $scope.eventForm.$dirty) {
            if (confirm('You have unsaved changes, are you sure you want to leave?')) {
                $location.path('/events');
            }
        } else {
            $location.path('/events');
        }
    };
    
    // Reset form to original state
    $scope.resetForm = function() {
        if (confirm('Are you sure you want to reset all changes?')) {
            $scope.loadEventData();
        }
    };
    
    // Initial load
    $scope.loadEventData();
}]);