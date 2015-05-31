'use strict';

/**
 * @ngdoc function
 * @name iotboxApp.controller:DashboardCtrl
 * @description
 * # DashboardCtrl
 * Controller of the iotboxApp
 */

angular.module('iotboxApp')
 .controller('DashboardCtrl', function ($scope, $rootScope, $sails) 
{

    $sails.get("/me")
	  	.success(function (data, status, headers, jwr) {
	    	if (data.email)
	    		$scope.login = true;
	    	$scope.user = data;

			if ($scope.login)
				{
				    angular.extend($scope, {
				        center: {
				            lat: -26.858093,
				            lon: 25.294694,
				            zoom: 5
				        }
				    });

				 	$scope.gateways = [];
				    $scope.nodes = [];
				    $scope.modules = [];
				    $scope.moduleTypes = [
				    "All",
				    "BATE1_0",
				    "HUMI1_0",
				    "LIGH1_0",
				    "TEMP1_0",
				    "SWCH1_0"
				    ];
				    
				    $scope.moduleActuators = [
				    {module: "SWCH1_0", type: 'toggle'}
				    ]; 

				    $scope.isActuator = function(module)
				    {
				    	// console.log('asdf',module,(module in $scope.moduleActuators));
				    	for (var i = 0; i < $scope.moduleActuators.length; i++) {
				    		if ($scope.moduleActuators[i].module == module) return true;
				    	};
				    	return false;
				    }

				    $scope.toggleActuator = function(module)
				    {
						var id = $scope.currentGateway.split('Gateway')[1];
						var node = $scope.currentNode;
				    	$sails.post('/heartbeat/sendCommand', {gateway: id, cmd: {node: node, module: module, cmd: 'toggle'}})
					      	.success(function (data2, status, headers, jwr) {
					    	
							    $scope.$applyAsync(function() 
					    		{
					    			$scope.messages.push({body: 'Command sent.', class: 'success'});
						   		});
						   		setTimeout(function(){
						   			$scope.$applyAsync(function() 
									{
										$scope.messages.shift();
									});
						   		},3000);

					    	})	
							.error(function (data2, status, headers, jwr) {
					       		// alert('Houston, we got a problem!');
					       		console.log('error', data2, status, headers);
					      	});
					}

				    $scope.moduleOptionDefaults = {
				    	'Delta': [{key: 'Time', value: 100},{key: 'Value', value: 4}],
				    	'Extreme': [{key: 'Max', value: 100},{key: 'Min', value: -40}],
				    	'Safe': [{key: 'Max', value: 100},{key: 'Min', value: -40}],
				    	'Toggle': [{key: 'Times', value: 5},{key: 'Delay', value: 1000}],
				    	'Blink': [{key: 'Delay', value: 1000}],
				    	'State': [{key: 'State', value: 1}]
				    };

				    $scope.moduleOptions = [
				    	'Delta',
				    	'Extreme',
				    	'Safe',
				    	'Blink',
				    	'State'
				    ];

				    $scope.graphData = [];
				    $scope.messages = [];
				    $scope.datapointLimit = 100;
				    $scope.markers = [
				            	{
				                    lat: -26.858093,
				                    lon: 25.294694,
				                    label: {
				                        message: '<h1>A</h1>',
				                        show: false,
				                        showOnMouseOver: true
				                    }
				                }
				        ];

				 	$scope.newCount = 0;

				 	$sails.get("/datapoint")
					    .success(function (data, status, headers, jwr) {
					    	// console.log("got datapoints",data);
					    })
					    .error(function (data, status, headers, jwr) {
					    	// alert('Houston, we got a problem!');
					    });

				    $sails.get("/gateway")
				      	.success(function (data, status, headers, jwr) {
				    		$scope.gateways = data;
				    		// console.log("got gateways",data)
				      	})
				      	.error(function (data, status, headers, jwr) {
				       		// alert('Houston, we got a problem!');
				      	});

				    // Watching for updates
				    $sails.on("gateway", function (message) {
				    	// alert(message.data);
				    	$scope.$applyAsync(function() 
				    	{
				    		$scope.gateways.push(message.data);
				    	});
				    });    

				    // Watching for updates
				    $sails.on("nodes", function (message) {
				    	// alert(message.data);
				    	$scope.$applyAsync(function() 
				    	{
				    		$scope.gateways.push(message.data);
				    	});
				    });

					$sails.on("datapoint", function (message) {

							console.log(message.data.node,$scope.currentNode);
						if (message.data.node == $scope.currentNode)
						{	
							console.log(message);
							$scope.$applyAsync(function() {
								$scope.newCount++;
								message.data.timestamp = Date.parse(message.data.createdAt);

								if ($scope.module)
								{
									if ($scope.module == message.data.module)
									{
										var arr = $scope.graphData;
										// arr.pop();
										arr.unshift(message.data);
										$scope.graphData = angular.copy(arr);
									}
								}
								else
								{
									var arr = $scope.graphData;
									// arr.pop();
									arr.unshift(message.data);
									$scope.graphData = angular.copy(arr);
					    		}
					    	});
						}
					});

				    $scope.drawGraph = function(s,module)
				    {
				    	var serial = angular.copy(s);
				    	if (module) serial += ("&module="+module);
				    	$scope.$applyAsync(function() 
				    	{
					    	$('#collapseTwo').show(200);
							$sails.get("/datapoint/?node=" + serial + "&limit=" +  $scope.datapointLimit + "&sort=createdAt%20desc")
						    .success(function (data, status, headers, jwr) {
						    	$scope.graphData = data.map(function(obj){ 
								   var rObj = obj;
								   rObj.timestamp = Date.parse(obj.createdAt);
								   return rObj;
								});
								$scope.currentNode = s;
								$scope.n = 0;
								$scope.module = module;
						    	console.log("got datapoints",$scope.graphData);
						    })
						    .error(function (data, status, headers, jwr) {
						    	// alert('Houston, we got a problem!');
						    });
						});
				    };

				    $scope.getNodes = function(serial)
				    {   
				    	$scope.$applyAsync(function() 
				    	{
					    	$scope.newCount = 0;	
					    	$scope.graphData = [];	
					    	$scope.currentGateway = serial;
					    	// $scope.currentNode = serial;
					    	
					    	$scope.gateways.forEach(function(gateway){
					    		if (gateway.serial == serial)
					    			gateway['class'] = "success";
					    		else
					    			gateway['class'] = "info";
					    	});

					    	$sails.get("/node/byGateway?serial="+serial)
					      	.success(function (data, status, headers, jwr) {
					    		$scope.nodes = data;
					    		console.log("got nodes",data)
					      	})
					      	.error(function (data, status, headers, jwr) {
					       		// alert('Houston, we got a problem!');
					      	});
				      	});
				    };

				    $scope.editNode = function(serial)
				    {   
				    	$scope.$applyAsync(function() 
				    	{
					    	$sails.get("/node?serial="+serial)
					      	.success(function (data, status, headers, jwr) {
					    		// var node = data[0];
					    		// node.createdAt = new Date(node.createdAt).toDateString();
					    		$scope.n = data[0];
					    		console.log("got nodes",data)
					      	})
					      	.error(function (data, status, headers, jwr) {
					       		// alert('Houston, we got a problem!');
					      	});
				      	});
				    };

				    $scope.addSetting = function()
				    {
				       	$scope.$applyAsync(function() 
				    	{
				    		$scope.n.settings.push({module: 'All', key: 'Delta', value: [{key: 'Time', value: 100},{key: 'Value', value: -40}]});
				    	});
				    }

				    $scope.saveNode = function()
				    {

				    	for (var i = 0; i < $scope.n.settings.length; i++) {
				    		delete $scope.n.settings[i].$$hashKey;
				    			console.log('i=',i);
				    		if ($scope.n.settings[i].class == 'danger')
				    		{
				    			$scope.n.settings.splice(i, 1);
				    			i--;
				    			console.log('Deleted. i=',i);
				    		}
				    		else
				    		{
					    		for (var j = 0; j < $scope.n.settings[i].value.length; j++) {
					    			delete $scope.n.settings[i].value[j].$$hashKey;
					    		};
				    		}
				    	};
				    	console.log('Save',$scope.n);

				    	$sails.post('/node/update/' + $scope.n.id, $scope.n)
					      	.success(function (data, status, headers, jwr) {
					    	
					    	var id = $scope.currentGateway.split('Gateway')[1];
					    	$sails.post('/heartbeat/sendSettings', {gateway: id, node: data})
						      	.success(function (data2, status, headers, jwr) {
						    	
								    $scope.$applyAsync(function() 
						    		{
						    			$scope.messages.push({body: 'Changes successfully saved.', class: 'success'});
							   		});
							   		setTimeout(function(){
							   			$scope.$applyAsync(function() 
										{
											$scope.messages.shift();
										});
							   		},3000);

						    	})	
								.error(function (data2, status, headers, jwr) {
						       		// alert('Houston, we got a problem!');
						       		console.log('error', data, status, headers);
						      	});
					      	  	// $scope.n = 0;
							  	// /heartbeat/sendSettings?gateway=5556806aee16297f0f339397&node=asdf

					    		console.log("got editNode",data);

					      	})
					      	.error(function (data, status, headers, jwr) {
					       		// alert('Houston, we got a problem!');
					       		console.log('error', data, status, headers);
					      	});

					      	// , function (resData) {

		
						//   console.log(resData); 

				    };
			    }



	  	})
	  	.error(function (data, status, headers, jwr) {
	   		$scope.login = false;
	    	$scope.user = {};
	  	});

	
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