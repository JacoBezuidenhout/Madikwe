// app.js
angular
  .module('iotboxApp', [
    'userModule',
    'ngRoute',
    'ngAnimate',
    'ngSails',
    'angular-dimple'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'scripts/views/main.html',
        controller: 'MainCtrl'
      })
      .when('/test', {
        templateUrl: 'scripts/views/dashboard.html',
        controller: 'DashboardCtrl'
      })
      .when('/login', {
        templateUrl: 'scripts/views/login.html'
      })      
      .when('/heartbeat', {
        templateUrl: 'scripts/views/heartbeat.html',
        controller: 'HeartbeatCtrl'
      })
      .when('/dashboard', {
        templateUrl: 'scripts/views/test.html',
        controller: 'TestCtrl'
      })
      .when('/map', {
        templateUrl: 'scripts/views/map.html',
        controller: 'MainCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });