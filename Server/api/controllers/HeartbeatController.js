/**
 * HeartbeatController
 *
 * @description :: Server-side logic for managing heartbeats
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var io = require('socket.io')(5000);
var proj4 = require('proj4');
var checksum = require('checksum');
var interval = 1000;
var clients = {};

// io.set('heartbeat interval', 10);
// io.set('heartbeat timeout', 35);
io.on('connection', function (socket) 
{
  console.log("New Connection Made");
  var login = false;
  var pinging = 0;

  var getStatus = function(line,cb)
  {
    // Node.findOne({id: line.node},function(err,node){
    //   console.log(err,node);
    //   if (line.value > node.settings.safe.min && line.value < node.settings.safe.max)
        cb('success');
    //   else
    //     cb('danger');
    // });
  }

  socket.on('NI', function (msg) 
  {
    msg.gateway = 'HillHouse';
    Node.findOrCreate({serial:msg.node},{serial: msg.node, type: msg.type, apiCount: 0}).exec(function (err,node){
      node.NI = msg.value;
      node.save();
    });
  });

  var trackers = {};

  var properties = {
    "stroke": "#00ff00",
    "stroke-width": 2,
    "stroke-opacity": 0.5,
    "tracker": "A"
  }
  var geoLine = {
    "type": "LineString",
    "coordinates": []
  }
  var geoPoint = {
    "type": "LineString",
    "coordinates": []
  }

  socket.on('gps', function (msg) 
  {
    properties.tracker = msg.node;
    properties.stroke = msg.color;
    
    geoLine.coordinates = [];


    var myDate = new Date();
    myDate.setMinutes(myDate.getMinutes() - 10);

    Map.findOrCreate(
      {serial: msg.node, "geometry.type": "LineString", "updatedAt" : { $gte : myDate }},
      {serial: msg.node, type: 'Feature', geometry: geoLine, properties: properties, trackerType: msg.type, }
    )
    .exec(function (err,res){
      // console.log('GPS',res);
      var c = proj4('EPSG:3857', [msg.lat,msg.lon]);
      res.geometry.coordinates.push(c);
      res.save();

    });

    // Map.create({serial: msg.node, type: 'Feature', geometry: geoLine, properties: properties, trackerType: msg.type, }).exec(function (err,res){
    //   console.log('GPS',res);
    // });

        
  
  });


// {
//   "type": "FeatureCollection",
//   "features": [
//     {
//       "type": "Feature",
//       "properties": {
//         "marker-color": "#00ff00",
//         "marker-size": "small",
//         "marker-symbol": "minefield",
//         "node": "NodeSerial"
//       },
//       "geometry": {
//         "type": "Point",
//         "coordinates": [
//           26.577987670898438,
//           -24.703484357475112
//         ]
//       }
//     },
    
//   ]
// }

  socket.on('data', function (msg) 
  {
    msg.gateway = 'HillHouse';
    Node.findOrCreate({serial:msg.node},{serial: msg.node, type: msg.type, apiCount: 0}).exec(function createFindCB(err,node){
      

      // console.log(err,msg,node);
      // console.log(msg.module);

      var flag = false;
      if (node.modules)
      {
        for (var i = 0; i < node.modules.length; i++) {
          if (node.modules[i] == msg.module)
            flag = true;
        };
      }
      else
      {
        node.modules = [];
      }


      node.apiCount = node.apiCount || 0;
      node.apiCount++;
      
      if (!flag)
        node.modules.push(msg.module);

      node.save();

      Gateway.findOne({serial: 'HillHouse'},function(err,data){

        flag = false;
        // console.log(data);

        if (data.nodes)
        {
          for (var i = 0; i < data.nodes.length; i++) {
            if (data.nodes[i] == msg.node)
              flag = true;
          };
        }
        else
        {
          data.nodes = [];
        }


        data.apiCount = data.apiCount || 0;
        data.apiCount++;

        if (!flag)
          data.nodes.push(msg.node);

        flag = false;
        if (data.modules)
        {
          for (var i = 0; i < data.modules.length; i++) {
            if (data.modules[i] == msg.module)
              flag = true;
          };
        }
        else
        {
          data.modules = [];
        }

        if (!flag)
          data.modules.push(msg.module);

        data.save();


          Datapoint.create(msg).exec(function createCB(err,created){
            // console.log('Datapoint created',created,cs);
            Datapoint.publishCreate(created);
          });
        
      });


    });
  });

  socket.on('disconnect', function () {
    // console.log('user disconnected');
  });

});

module.exports = {

};

