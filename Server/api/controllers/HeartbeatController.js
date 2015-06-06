/**
 * HeartbeatController
 *
 * @description :: Server-side logic for managing heartbeats
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

setTimeout(function(){

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

  var sendAlert = function(a)
  {
    console.log('Alert',a);
  }

  socket.on('NI', function (msg) 
  {
    msg.gateway = 'HillHouse';
    Node.findOrCreate({serial:msg.node},{serial: msg.node, type: msg.type, apiCount: 0}).exec(function (err,node){
      node.NI = msg.value;
      node.save();
    });
  });

  socket.on('frame', function (msg) 
  {
    msg.gateway = 'HillHouse';
    Packet.create(msg).exec(function (err,node){});
  });

  socket.on('alert', function (msg) 
  {
    Alert.create(msg)
    .exec(function (err,res){
      sendAlert(msg);
      Alert.publishCreate(res);
    });
  });

  socket.on('gps', function (msg) 
  {
    Map.create(msg)
    .exec(function (err,res){
      Map.publishCreate(res);
    });
  });

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

}, 5000);
module.exports = {

};

