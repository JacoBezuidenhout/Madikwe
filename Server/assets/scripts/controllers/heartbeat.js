'use strict';

/**
 * @ngdoc function
 * @name HeartbeatCtrl
 * @description

incomming message:
item: gateway : {serial:<SERIAL>, type: <TYPE>, location: {lat: <lat>, lon: <lon>}}
item: message : {body: <MESSAGE_BODY>,class: [success,danger,info,warning]}

 HeartbeatCtrl
 * Controller of the iotboxApp
 */

angular.module('iotboxApp')
 .controller('HeartbeatCtrl', function ($scope, $rootScope, $sails) {

	if ($rootScope.login)
	{
	 	$scope.gateways = [];
	 	$scope.messages = [];
	 	$scope.subscribed = false;
	 	$scope.showMessage = true;

	 	$sails.get("/heartbeat")
	      	.success(function (data, status, headers, jwr) {
		    	$scope.subscribed = true;
	      	})
	      	.error(function (data, status, headers, jwr) {
	       		// alert('Houston, we got a problem!');
	      	});

	    // Watching for updates
	    $sails.on("heartbeat", function (message) {
	    	console.log(message.data);
	    	var flag = false;
	    	for (var i = 0; i < $scope.gateways.length; i++) {
	    		if ($scope.gateways[i].serial === message.data.gateway.serial)
				{
					flag = true;
					$scope.gateways[i] = message.data.gateway;
				}
	    	};
	    	if (!flag) $scope.gateways.push(message.data.gateway);
	    	$scope.messages.unshift(message.data.message);
	    	$scope.showMessage = false;
	    });
	}

  });

/* 	$scope.graphdata = [];
    var gateways = [];
    $scope.gateways = [];

  	var getModules = function(serial) {
		var defaultSettings = {delta: {time: 300, value: 2}, min: -20, max: 65, safe: {min: 15, max: 35}};
		
		var arr = [ 'Car', 'Car', 'Truck', 'Boat', 'Truck' ];
		var hist = {};
		arr.map( function (a) { if (a in hist) hist[a.type] ++; else hist[a] = 1; } );
		console.log(hist);

		return [];
	};
  	var getDataset = function(node,module) {
		return [];
	};

	$scope.loadNode = function(node,gateway) {
		$scope.data = node;
		$scope.data.gateway = gateway;
		var data = [];

		node.modules.forEach(function(module){
	        data = data.concat(getDataset(node,module));
	    });

		$scope.graphdata = data;
	};	

	$scope.back = function() {
		$scope.data.gateway = '';
	};

	$scope.drawGraph = function(node,module) {
		var data = getDataset(node,module);
		$scope.graphdata = data;
	};

	    // $scope.gateways = [
    // 	{serial: 'EDISON0123', type:'EDISON1.0', nodes:[{serial:'cdf', icon: 'XB8LP.png' ,type:'XB8LP'},{serial:'d1a', icon: 'XB8LP.png', type:'XB8LP'}]},
    // 	{serial: 'EDISON4567', type:'EDISON1.0', nodes:[{serial:'cf0', icon: 'XB8LP.png' ,type:'XB8LP'},{serial:'d2e', icon: 'XB8LP.png', type:'XB8LP'}]}
    // ];

	$sails.get("/gateway")
      	.success(function (data, status, headers, jwr) {
    		$scope.gateways.forEach(function(gateway){
		    	gateway.nodes.forEach(function(node){
					node.modules = getModules(node.serial);
				});
			});
        	$scope.gateways = data;
      	})
      	.error(function (data, status, headers, jwr) {
       		alert('Houston, we got a problem!');
      	});

    // Watching for updates
    $sails.on("gateway", function (message) {

    	console.log(message);

    	if (message.verb == "created") 
    	{
        	$sails.get("/gateway")
		      	.success(function (data, status, headers, jwr) {
		        	$scope.gateways = data;
		        	$scope.gateways.forEach(function(gateway){
					    gateway.nodes.forEach(function(node){
							node.modules = getModules(node.serial);
						});
					});
		      	})
		      	.error(function (data, status, headers, jwr) {
		        	alert('Houston, we got a problem!');
		      	});
       	}
       	if (message.verb == "updated") 
    	{
			$sails.get("/gateway")
		      	.success(function (data, status, headers, jwr) {
		        	$scope.gateways = data;
		        	$scope.gateways.forEach(function(gateway){
					    gateway.nodes.forEach(function(node){
							node.modules = getModules(node.serial);
						});
					});
		      	})
		      	.error(function (data, status, headers, jwr) {
		        	alert('Houston, we got a problem!');
		      	});
		    
		}
       	if (message.verb == "addedTo") 
    	{
			$sails.get("/gateway")
		      	.success(function (data, status, headers, jwr) {
		        	$scope.gateways = data;
		        	$scope.gateways.forEach(function(gateway){
					    gateway.nodes.forEach(function(node){
							node.modules = getModules(node.serial);
						});
					});
		      	})
		      	.error(function (data, status, headers, jwr) {
		        	alert('Houston, we got a problem!');
		      	});
		    
		}
    });*/