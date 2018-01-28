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
	}).otherwise({
		redirectTo : '/login'
	});
}]);
myApp.run(['$rootScope', '$location',
function($rootScope, $location) {

	$rootScope.$on('$routeChangeStart', function(event, currRoute, prevRoute) {
		if (currRoute.originalPath == '/home') {
			$rootScope.tog = 1;
		} else {
			$rootScope.tog = 2;
		}
	});
}]);
