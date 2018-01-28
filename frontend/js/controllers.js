var guestControllers = angular.module('guestControllers', [])

guestControllers.controller('ListController', ['$rootScope','$scope', '$http', '$timeout',
function($rootScope, $scope, $http, $timeout) {
	// $rootScope.userId = $scope.userId || 'vishvajit79@gmail.com';
	$rootScope.userId = $scope.userId;


	$scope.dateString = function() {
		var d = new Date();
		return d.getFullYear() + "" + ('0' + (d.getMonth() + 1)).slice(-2) + "" + ('0' + d.getDate()).slice(-2);
	};
	
	$scope.showListIcon = true;
	$scope.printGuestList = function() {
		var printContents = document.getElementById("GList").innerHTML;
		var popupWin = window.open('', '_blank', 'width=1700,height=2200');
		popupWin.document.open();
		popupWin.document.write('<html><link rel="stylesheet" media="all" href="css/style.css"><link href="css/limestone.css" rel="stylesheet"  media="all"></head><body onload="window.print()">' + printContents + '</html>');
		popupWin.document.close();
	};
	$scope.printpage = function() {
		var originalContents = document.body.innerHTML;
		var printReport = document.getElementById('content').innerHTML;
		document.body.innerHTML = printReport;
		window.print();
		document.body.innerHTML = originalContents;
	};
	$scope.go_back = function() {
		window.history.back();
	};


    $rootScope.sendRequest = function() {
    	var data = { 'doctor' : $rootScope.userId, 'patient': $scope.patientId};
    	$scope.requesting = true;
        $http({
            url: 'http://54.209.93.68:3000/_requestAccess',
            method: "POST",
            data: data
        })
		.then(function(response) {
			console.log(response.data)
			$scope.requesting = false;

            },
		function(response) { // optional
			// failed
		});
		console.log(data);
    }
}]);
