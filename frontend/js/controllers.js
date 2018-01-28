var guestControllers = angular.module('guestControllers', ['ngStorage'])

guestControllers.controller('ListController', ['$rootScope','$scope', '$http', '$timeout', '$location', '$localStorage',
function($rootScope, $scope, $http, $timeout, $location, $localStorage) {
	// $rootScope.userId = $scope.userId || 'vishvajit79@gmail.com';

    var ss = $localStorage;
    $scope.$storage = $localStorage;

    if($scope.userId != null){
        $scope.$storage.user = $scope.userId;
    }

    $rootScope.userId = $scope.$storage.user;

    $rootScope.userLogin = function() {
        $rootScope.userId = $scope.userId;
        userId = $scope.userId;
        console.log(userId);
		$location.path('/home');
    };

    $rootScope.logoutRequest = function () {
        $localStorage.$reset();
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

    $scope.pateintId = 'vishvajit79@gmail.com';

    // Doctor1 transactions

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
            $location.path("/home");

            },
		function(response) { // optional
			console.log(response.data);
            $scope.requesting = false;
            alert('There was an error while submitting request.');
        });
		console.log(data);
    };

    $rootScope.patientDetails = function() {
        var data = { 'pateintId' : $rootScope.userId};
        $scope.requesting = true;
        $http({
            url: 'http://54.209.93.68:30001/api/Patient/' + data['pateintId'],
            method: "GET"
        })
        .then(function(response) {
            console.log(response.data)
            $scope.approvals = response.data.approvals;
            $scope.json = response.data;
            $scope.requesting = false;

        },
        function(response) { // optional
            console.log(response.data);
            $scope.requesting = false;
            alert('There was an error while submitting request.');
        });
    };

    $rootScope.doctorDetails = function() {
        var data = { 'doctorId' : $rootScope.userId};
        $scope.requesting = true;
        $http({
            url: 'http://54.209.93.68:30001/api/Doctor/' + data['doctorId'],
            method: "GET"
        })
		.then(function(response) {
            console.log(response.data)
			$scope.approvals = response.data.approvals;
			$scope.json = response.data;
			$scope.requesting = false;

		},
		function(response) { // optional
			console.log(response.data);
			$scope.requesting = false;
			alert('There was an error while submitting request.');
		});
    };

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
                window.location.reload();

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
                window.location.reload();

            },
            function(response) { // optional
                console.log(response.data);
                $scope.requesting = false;
                alert('There was an error while submitting request.');
            });
    };

    $rootScope.showDocument = function () {
    	var data = {'doctorId': $rootScope.userId, 'recordsId': $scope.patientId}
        $scope.requesting = true;
    	console.log(data);
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

    $rootScope.historian = function () {
        $scope.requesting = true;
        $http({
            url: 'http://54.209.93.68:30001/api/system/historian',
            method: "GET"
        })
        .then(function(response) {
                $scope.historian = response.data;
                $scope.requesting = false;

            },
            function(response) { // optional
                console.log(response.data);
                $scope.requesting = false;
                alert('There was an error while submitting request.');
            });
    };

    $rootScope.isPatient = function () {
        return $rootScope.userId == 'sam.benny@gmail.com';
    }

    if($rootScope.userId != null){
        if ($scope.isPatient ()) {
            $rootScope.patientDetails();
        } else {
            $rootScope.doctorDetails();
        }
        $rootScope.historian();
    }



    $rootScope.randomDate = function(date1, date2){
        function getRandomArbitrary(min, max) {
            return Math.random() * (max - min) + min;
        }
        var date1 = date1 || '01-01-1970'
        var date2 = date2 || new Date().toLocaleDateString()
        date1 = new Date(date1).getTime()
        date2 = new Date(date2).getTime()
        if( date1>date2){
            return new Date(getRandomArbitrary(date2,date1)).toLocaleDateString()
        } else{
            return new Date(getRandomArbitrary(date1, date2)).toLocaleDateString()

        }
    };  

}]);
