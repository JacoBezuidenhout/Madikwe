'use strict';

/**
 * @ngdoc function
 * @name iotboxApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the iotboxApp
 */
angular.module('iotboxApp')
  .controller('MainCtrl', ['$scope', '$location', 'authFactory', function ($scope, $location, authFactory) {
    
    $scope.user = authFactory.user();

   	$scope.login = function()
   	{
   		authFactory.login($scope.identifier,$scope.password,function(res){
   			if (res.email)
   			{
   				// alert(res);
   				$location.url('/dashboard');
   			}
   			else
   			{
   				alert("error");
   			}
   		});
	}	


  }]);
