angular.module('charityEventsAdmin')
.controller('NavController', ['$scope', '$location', '$route', '$window', function($scope, $location, $route, $window) {
    console.log('NavController initialized');
    
    $scope.isActive = function(path) {
        return $location.path() === path;
    };
    
    $scope.navigateTo = function(path) {
        console.log('Navigating to:', path);
        $location.path(path);
    };
}]);