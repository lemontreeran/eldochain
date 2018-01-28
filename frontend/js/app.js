var myApp = angular.module('myApp', ['ngRoute', 'guestControllers']);

myApp.config(['$routeProvider',
function($routeProvider) {
	$routeProvider.when('/request', {
		templateUrl : 'views/includes/request.html',
		controller : 'ListController'
	}).when('/history', {
		templateUrl : 'views/history.html',
		controller : 'ListController'})
    .when('/login', {
		templateUrl : 'views/includes/login.html',
		controller : 'ListController'
	}).when('/home', {
		templateUrl : 'views/home.html',
		controller : 'ListController'
    }).when('/contact', {
        templateUrl : 'views/contact.html',
        controller : 'ListController'
    }).when('/logout', {
        templateUrl : 'views/includes/login.html',
        controller : 'ListController'
	}).when('/records', {
        templateUrl : 'views/includes/records.html',
        controller : 'ListController'
	}).otherwise({
		redirectTo : '/login'
	});
}]);
