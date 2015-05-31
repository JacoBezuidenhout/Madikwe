// test.js
angular.module('iotboxApp')
  .controller('TestCtrl', ['$scope', '$sails', 'authFactory', function ($scope, $sails, authFactory) {
      authFactory.user(function(me){
        $scope.user = me;
        console.log($scope.user);
      });
      
      $sails.get("/gateway")
      .success(function (data, status, headers, jwr) 
      {
        $scope.gateways = data;
      })
      .error(function (data, status, headers, jwr) 
      {
        console.log(data);
      });

    }])
    .controller('GatewayCtrl', ['$scope', '$sails', 'authFactory', function ($scope, $sails, authFactory) {
     
      $scope.setGateway = function(g)
      {
        $scope.$applyAsync(function() 
        {
          $scope.gateway = g;
          $sails.get("/gateway/" + g.id)
          .success(function (data, status, headers, jwr) {
            $scope.nodes = data.nodes;
            $scope.gateway = data;
            console.log("got nodes",data);
          })
          .error(function (data, status, headers, jwr) {
            // alert('Houston, we got a problem!');
          });
        });
      };

      $scope.gatewaySave = function()
      {
        console.log('gatewaySave');  
      };

      $scope.nodeSet = function(n)
      {
        $scope.$applyAsync(function() 
        {
          console.log('setNode',n);
          $scope.node = n;
        });
      };

    }])
    .controller('NodeCtrl', ['$scope', '$sails', function ($scope, $sails) {
              

      $scope.moduleOptions = 
      {
        'All' :     { 
                      values : 
                      [
                        {key : 'Delta', defaults : [{key: 'Time', value: 100},{key: 'Value', value: 4}] },
                        {key : 'Extreme', defaults : [{key: 'Max', value: 100},{key: 'Min', value: -40}] },
                        {key : 'Safe', defaults : [{key: 'Max', value: 60},{key: 'Min', value: 10}] }
                      ],
                      type : 'sensor' 
                    },
        'BATE1_0' : { 
                      values : 
                      [
                        {key : 'Delta', defaults : [{key: 'Time', value: 100},{key: 'Value', value: 4}] },
                        {key : 'Extreme', defaults : [{key: 'Max', value: 100},{key: 'Min', value: -40}] },
                        {key : 'Safe', defaults : [{key: 'Max', value: 60},{key: 'Min', value: 10}] }
                      ],
                      type : 'sensor' 
                    },
        'HUMI1_0' : { 
                      values : 
                      [
                        {key : 'Delta', defaults : [{key: 'Time', value: 100},{key: 'Value', value: 4}] },
                        {key : 'Extreme', defaults : [{key: 'Max', value: 100},{key: 'Min', value: -40}] },
                        {key : 'Safe', defaults : [{key: 'Max', value: 60},{key: 'Min', value: 10}] }
                      ],
                      type : 'sensor' 
                    },
        'LIGH1_0' : { 
                      values : 
                      [
                        {key : 'Delta', defaults : [{key: 'Time', value: 100},{key: 'Value', value: 4}] },
                        {key : 'Extreme', defaults : [{key: 'Max', value: 100},{key: 'Min', value: -40}] },
                        {key : 'Safe', defaults : [{key: 'Max', value: 60},{key: 'Min', value: 10}] }
                      ],
                      type : 'sensor' 
                    },
        'TEMP1_0' : { 
                      values : 
                      [
                        {key : 'Delta', defaults : [{key: 'Time', value: 100},{key: 'Value', value: 4}] },
                        {key : 'Extreme', defaults : [{key: 'Max', value: 100},{key: 'Min', value: -40}] },
                        {key : 'Safe', defaults : [{key: 'Max', value: 60},{key: 'Min', value: 10}] }
                      ],
                      type : 'sensor' 
                    },
        'SWCH1_0' : { 
                      values : 
                      [
                        {key : 'Delta', defaults : [{key: 'High -> Low', value: 0},{key: 'Low -> High', value: 0},{key: 'Time', value: 100}] },
                        {key : 'Blink', defaults : [{key: 'Delay', value: 1000}] },
                        {key : 'State', defaults : [{key: 'State', value: 1}] }
                      ],
                      type : 'actuator' 
                    }
      };

      $scope.actuatorAlerts = [];

      $scope.moduleOptionDefaults = function(m,k)
      {
        console.log($scope.moduleOptions[m],m,k);
        var defaults = 0;

        for (var i = 0; i < $scope.moduleOptions[m].values.length; i++) {
          console.log($scope.moduleOptions[m].values[i].key);
          if ($scope.moduleOptions[m].values[i].key == k)
            defaults = $scope.moduleOptions[m].values[i].defaults;
        };
         
        return defaults;
      };

      $scope.isActuator = function(m)
      {
        return ($scope.moduleOptions[m].type == 'actuator');
      };

      $scope.toggleActuator = function(m)
      {
        $scope.$applyAsync(function() 
        {
          $scope.actuatorAlerts.push({class : 'success', body : m + ': toggle sent.'});
        });
      };

      $scope.getState = function(m)
      {
        if ($scope.isActuator(m))
        {
          if (1)
            return 'primary';
          else
            return 'danger';
        }
      };

      $scope.settingAdd = function()
      {
        $scope.$applyAsync(function() 
        {
          $scope.node.settings.push({module: 'All', key: 'Delta', value: [{key: 'Time', value: 100},{key: 'Value', value: -40}]});
          console.log('settingAdd');
        });
      };      

      $scope.nodeSave = function()
      {
        for (var i = 0; i < $scope.node.settings.length; i++) 
        {
          delete $scope.node.settings[i].$$hashKey;
            console.log('i=',i);
          if ($scope.node.settings[i].class == 'danger')
          {
            $scope.node.settings.splice(i, 1);
            i--;
            console.log('Deleted. i=',i);
          }
          else
          {
            for (var j = 0; j < $scope.node.settings[i].value.length; j++) {
              delete $scope.node.settings[i].value[j].$$hashKey;
            };
          }
        };
        console.log('nodeSave',$scope.node);
      };

      $scope.nodeReset = function()
      {
        console.log('nodeReset');
      };

      $scope.datapointsGet = function(n,m,l)
      {
        console.log('datapointsGet');
        //_id = serial
        var query = "/datapoint/?node=" + n.serial;
        if (m != "")
          query += "&module=" +  m;
        query += "&limit=" +  l + "&sort=createdAt%20desc";

        $scope.$applyAsync(function() 
        {
          $sails.get(query)
          .success(function (data, status, headers, jwr) {
            $scope.datapoints = data.map(function(obj){ 
             var rObj = obj;
             rObj.timestamp = Date.parse(obj.createdAt);
             return rObj;
            });
            console.log("got datapoints",$scope.graphData);
          })
          .error(function (data, status, headers, jwr) {
            // alert('Houston, we got a problem!');
          });
        });
      };

    }])
  	.directive('gateways', function() {
  		return {
  			scope: {
            gateways: '=data',
      			setGateway: '=fn'
    		},
    			templateUrl: 'scripts/modules/directives/gateways.html'
  		};
  	})
  	.directive('gatewaysettings', function() {
    		return {
    			scope: {
        			gateway: '=data' 
      		},
      			templateUrl: 'scripts/modules/directives/gatewaySettings.html'
    		};
  	})
  	.directive('gatewaysummary', function() {
    		return {
    			scope: {
        			gateway: '=data'
      		},
      			templateUrl: 'scripts/modules/directives/gatewaySummary.html'
    		};
  	})
  	.directive('nodes', function() {
    		return {
    			scope: {
        			nodes: '=data',
              nodeSet: '=fn'
      		},
      			templateUrl: 'scripts/modules/directives/nodes.html'
    		};
  	})
    .directive('nodedetails', function() {
        return {
          scope: {
              node: '=data'
          },
            templateUrl: 'scripts/modules/directives/nodeDetails.html'
        };
    })
    .directive('nodesettings', function() {
        return {
          scope: {
              node: '=data'
          },
            templateUrl: 'scripts/modules/directives/nodeSettings.html'
        };
    })
    .directive('nodesummary', function() {
        return {
          scope: {
              node: '=data'
          },
            templateUrl: 'scripts/modules/directives/nodeSummary.html'
        };
    })
    .directive('datapoints', function() {
        return {
          scope: {
              datapoints: '=data',
              node: '=node',
              datapointsGet: '=fn'
          },
            templateUrl: 'scripts/modules/directives/datapoints.html'
        };
    })
    .directive('actuators', function() {
        return {
          scope: {
              node: '=data',
              actuatorAlerts: '=alerts',
              isActuator: '=fn',
              getState: '=gn',
              toggleActuator: '=hn'
          },
            templateUrl: 'scripts/modules/directives/actuators.html'
        };
    })
  	.directive('graphs', function() {
    		return {
    			scope: {
              graphData: '=data',
              node: '=node',
        			datapointsGet: '=fn'
      		},
      			templateUrl: 'scripts/modules/directives/graphs.html'
    		};
  	})
  	.directive('map', function() {
    		return {
    			scope: {
        			nodeS: '=data'
      		},
      			templateUrl: 'scripts/modules/directives/map.html'
    		};
  	});