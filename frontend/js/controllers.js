var guestControllers = angular.module('guestControllers', [])

guestControllers.controller('ListController', ['$rootScope','$scope', '$http', '$timeout', '$location',
function($rootScope, $scope, $http, $timeout, $location) {
	// $rootScope.userId = $scope.userId || 'vishvajit79@gmail.com';
    $rootScope.userId = $scope.userId;
    $rootScope.userId = 'vishvajit79@gmail.com';
    $rootScope.userLogin = function() {
        $rootScope.userId = $scope.userId;
        userId = $scope.userId;
        console.log(userId);
		$location.path('/home');
    };

    $rootScope.logoutRequest = function () {
        $rootScope.userId = null;
        $location.path('/');
    };


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
			console.log(response.data);
            $scope.requesting = false;
            alert('There was an error while submitting request.');
        });
		console.log(data);
    };

    $rootScope.userDetails = function() {
        var data = { 'doctorId' : $rootScope.userId};
        $scope.requesting = true;
        $http({
            url: 'http://54.209.93.68:30001/api/Doctor/' + data['doctorId'],
            method: "GET"
        })
		.then(function(response) {
				console.log(response.data);
				$scope.approvals = response.data.approvals;
				$scope.json = response.data;
				$scope.requesting = false;

		},
		function(response) { // optional
			console.log(response.data);
			$scope.requesting = false;
			alert('There was an error while submitting request.');
		});
        console.log(data);
    };
    $scope.userDetails();
    $rootScope.patientRecord = function($id) {
        $scope.requesting = true;
        $http({
            url: 'http://54.209.93.68:30001/api/Record/' + $id,
            method: "GET"
        })
            .then(function(response) {
                    console.log(response.data);
                    $scope.json = response.data;
                    $scope.requesting = false;

                },
                function(response) { // optional
                    console.log(response.data);
                    $scope.requesting = false;
                    alert('There was an error while submitting request.');
                });
    };

    $rootScope.approvePatient = function($record,$value) {
        var data = { 'record' : $record, 'approved': $value, 'userApproving': $rootScope.userId};
        $scope.requesting = true;
        $http({
            url: 'http://54.209.93.68:3000/_approveReject',
            method: "POST",
			data: data
        })
            .then(function(response) {
                    console.log(response.data);
                    $scope.json = response.data;
                    $scope.requesting = false;

                },
                function(response) { // optional
                    console.log(response.data);
                    $scope.requesting = false;
                    alert('There was an error while submitting request.');
                });
    };

    $rootScope.approvePatientByDoctor = function($record,$value) {
        var data = { 'record' : $record, 'granted': $value};
        $scope.requesting = true;
        $http({
            url: 'http://54.209.93.68:3000/_grantAccess',
            method: "POST",
            data: data
        })
            .then(function(response) {
                    console.log(response.data);
                    $scope.json = response.data;
                    $scope.requesting = false;

                },
                function(response) { // optional
                    console.log(response.data);
                    $scope.requesting = false;
                    alert('There was an error while submitting request.');
                });
    };

    $rootScope.showDocument = function () {
    	var data = {'doctorId': $rootScope.userId, 'recordsId': $rootScope.userId}
        $scope.requesting = true;
        $http({
            url: 'http://54.209.93.68:3000/_view',
            method: "POST",
            data: data
        })
            .then(function(response) {
                    console.log(response.data);
                    $scope.json = response.data;
                    $scope.requesting = false;

                },
                function(response) { // optional
                    console.log(response.data);
                    $scope.requesting = false;
                    alert('There was an error while submitting request.');
                });
    };
    $rootScope.showDocument();

    $rootScope.historian = function () {
        $scope.requesting = true;
        $http({
            url: 'http://54.209.93.68:30001/api/system/historian',
            method: "GET"
        })
            .then(function(response) {
                    console.log(response.data);
                    $scope.historian = response.data;
                    $scope.requesting = false;

                },
                function(response) { // optional
                    console.log(response.data);
                    $scope.requesting = false;
                    alert('There was an error while submitting request.');
                });
    };
    $rootScope.historian();
}]);
