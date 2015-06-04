'use strict';

/**
 * @ngdoc function
 * @name iotboxApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the iotboxApp
 */
angular.module('iotboxApp')
  .controller('MainCtrl', ['$scope', '$sails', '$location', 'authFactory', function ($scope, $sails, $location, authFactory) {
    
    $scope.isLoggedIn = false;

    $sails.get("/me",function(data)
    {
      console.log('ME',data);
      $scope.$applyAsync(function() 
        {
          if (data.email)
          {
            $scope.isLoggedIn = true;
          }  
          else
          {
            $scope.isLoggedIn = false;
          }
        });
    });

  }]);
