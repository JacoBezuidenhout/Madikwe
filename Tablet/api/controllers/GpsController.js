/**
 * GpsController
 *
 * @description :: Server-side logic for managing gps
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var settings = require('../../settings');
var location = {tracker: settings.tracker,lat:0,lon:0,speed:-1,heading:0,altitude:0};
var locationLast = {tracker: settings.tracker,lat:0,lon:0,speed:-1,heading:0,altitude:0};
try{
	var serialgps = require('serialgps');
	}catch(e){
		// console.log(e);
	}
var checksum = require('checksum');
var fs = require('fs');
var waiting = true;
var sendingOld = false;
var util = require('util');
var SerialPort = require('serialport').SerialPort;
var xbee_api = require('xbee-api');
var C = xbee_api.constants;
var xbeeAPI = new xbee_api.XBeeAPI({
  api_mode: 1
});

//create a new instance. arguments are serial port and baud rate
setTimeout(function(){
	
var exec = require('child_process').exec;
exec('"C:\\Program Files\\Internet Explorer\\iexplore.exe" http://localhost', function(error, stdout, stderr) {
    console.log('stdout: ' + stdout);
    console.log('stderr: ' + stderr);
    if (error !== null) {
        console.log('exec error: ' + error);
    }
});

	try{
		var g = new serialgps(settings.GPSPort,9600);
	}catch(e){
		// console.log(e);
	}
//monitor for data
	var count = 0;
	g.on('data', function(data) {
		locationLast = JSON.parse(JSON.stringify(location));
		try{
			
			if (data.sentence == 'RMC')
			{
				if (data.lat != '' && data.lon != '')
				{
					if (data.latPole == "S")
					  location.lat = -1* (parseInt(data.lat.substring(0, 2)) + parseFloat(data.lat.substring(2))/60);
					else
					  location.lat = parseInt(data.lat.substring(0, 2)) + parseFloat(data.lat.substring(2))/60;

					if (data.latPole == "W")
					  location.lon = -1* (parseInt(data.lon.substring(0, 3)) + parseFloat(data.lon.substring(3))/60);
					else
					  location.lon = parseInt(data.lon.substring(0, 3)) + parseFloat(data.lon.substring(3))/60;
						location.heading = data.trackTrue;
				}
				else
				{
					Gps.publishCreate({id:0});
				}
			} 
			else
			{
				if (data.lat != '' && data.lon != '')
				{
				  	if (data.sentence == 'GGA' && data.lat != '' && data.lon != '')
				  	{
					    if (data.latPole == "S")
					      location.lat = -1* (parseInt(data.lat.substring(0, 2)) + parseFloat(data.lat.substring(2))/60);
					    else
					      location.lat = parseInt(data.lat.substring(0, 2)) + parseFloat(data.lat.substring(2))/60;

					    if (data.latPole == "W")
					      location.lon = -1* (parseInt(data.lon.substring(0, 3)) + parseFloat(data.lon.substring(3))/60);
					    else
					      location.lon = parseInt(data.lon.substring(0, 3)) + parseFloat(data.lon.substring(3))/60;
					  
					  	location.altitude = data.alt;
				  	} 
				  	else
				  	{
					  	if (data.sentence == 'VTG')
					  	{
					  		location.speed = data.speedKmph;
					  		location.heading = data.trackTrue;
						} 
						else
							if (settings.debug) console.log(data);
				  	}
				}
				else
				{
					Gps.publishCreate({id:0});
				}
			}

		    if (settings.mock) location.lat += Math.random()-0.5;	
		    if (settings.mock) location.lon += Math.random()-0.5;	
		    if (settings.run)
		    {
		    	fs.appendFile('GPSLog.txt', JSON.stringify({GPSData:data,location: location}), function (err) {});
				
				if ((locationLast.lat != location.lat || locationLast.lon != location.lon) && (location.lat != 0 && location.lon != 0))
				{
				  	count++;
				  	if (count > 5)
				  	{
				 		Gps.publishCreate({id:-1,location: location});
						count = 0;
					}
	    		    Gps.create({location: location}).exec(function createCB(err, created){
	    			  if (settings.debug) console.log(created);
	    			});
    			}
    			
		    }
		}catch(e){
			console.log(e);
		}
	});

	var serialport = new SerialPort(settings.XBeePort, {
	  baudrate: 9600,
	  parser: xbeeAPI.rawParser()
	});

	serialport.on("open", function() 
	{
		var handleOther = function(data)
		{
			console.log('Handling',data,location);
			// Map.create({data:data,location:location,other:1}).exec(function createCB(err, created){
			// 	console.log('Handled',created);
			// });
			fs.appendFile('OtherLog.txt', JSON.stringify({GPSData:data,location: location}), function (err) {});
		}

		var handle = function(data)
		{
			console.log('Handling',data,location);
			// Map.create({data:data,location:location,other:0}).exec(function createCB(err, created){
			// 	console.log('Handled',created);
			// });
			fs.appendFile('DBLog.txt', JSON.stringify(data)+',', function (err) {});
		}

		function getBinarySize(string) {
		  return Buffer.byteLength(string, 'utf8');
		}
		
		var sendData = function(data)
		{
			console.log('Sending New');
			
			Packet.create(data).exec(function createCB(err, created){
				created.ack = false;
				created.cs = checksum(JSON.stringify(created));
				created.save();

				var packet = {i: created.id,lat:created.lat.toFixed(5),lon:created.lon.toFixed(5),cs:created.cs};
				
				var p = xbeeAPI.buildFrame(
					{
					    type: 0x00, // xbee_api.constants.FRAME_TYPE.TX_REQUEST_64  
					    destination64: "000000000000FFFF",
					    data:  JSON.stringify(packet)// Can either be string or byte array. 
					}
				);

				serialport.write(p);
			});
		}

		var sendOldData = function(data,index)
		{
			console.log('Sending Old',index);
			setTimeout(function(){
			var packet = {i: data.id,lat:data.lat.toFixed(5),lon:data.lon.toFixed(5),cs:data.cs};
				serialport.write(xbeeAPI.buildFrame(
					{
					    type: 0x00, // xbee_api.constants.FRAME_TYPE.TX_REQUEST_64  
					    destination64: "000000000000FFFF",
					    data:  JSON.stringify(packet)// Can either be string or byte array. 
					}
				));
			}, index*500);
		}

		var broadcast = function(cmd,val)
		{
			serialport.write(xbeeAPI.buildFrame(
				{
				    type: C.FRAME_TYPE.REMOTE_AT_COMMAND_REQUEST,
				    command: cmd,
				    commandParameter: val,
				}
			));
			// setTimeout(function(){
			// 	broadcast('DB',[]);
			// }, 1000);
		}

		setInterval(function(){
			broadcast('DB',[]);
		}, 1000);
		
		console.log('Serial Open');

		xbeeAPI.on("frame_object", function(frame) {
		    // console.log(">>", frame);
	    	switch(frame.type){
	    		case 146:
	    			if (typeof frame.analogSamples.AD1 !== 'undefined')		handleOther({node: frame.remote64, type: 'XBee868LP', module: 'BatteryA1', value: frame.analogSamples.AD1});
	    			if (typeof frame.analogSamples.AD2 !== 'undefined')		handleOther({node: frame.remote64, type: 'XBee868LP', module: 'ADC2', value: frame.analogSamples.AD2});
	    			if (typeof frame.digitalSamples.DIO0 !== 'undefined') 	handleOther({node: frame.remote64, type: 'XBee868LP', module: 'DIO0', value: frame.digitalSamples.DIO0});
	    			if (typeof frame.digitalSamples.DIO1 !== 'undefined') 	handleOther({node: frame.remote64, type: 'XBee868LP', module: 'DIO1', value: frame.digitalSamples.DIO1});
	    			if (typeof frame.digitalSamples.DIO2 !== 'undefined') 	handleOther({node: frame.remote64, type: 'XBee868LP', module: 'DIO2', value: frame.digitalSamples.DIO2});
	    			if (typeof frame.digitalSamples.DIO3 !== 'undefined') 	handleOther({node: frame.remote64, type: 'XBee868LP', module: 'DIO3', value: frame.digitalSamples.DIO3});
	    			if (typeof frame.digitalSamples.DIO4 !== 'undefined') 	handleOther({node: frame.remote64, type: 'XBee868LP', module: 'DIO4', value: frame.digitalSamples.DIO4});
	    			if (typeof frame.digitalSamples.DIO5 !== 'undefined') 	handleOther({node: frame.remote64, type: 'XBee868LP', module: 'DIO5', value: frame.digitalSamples.DIO5});
	    			break;
	    		case 151:
	    			// console.log(frame.commandData.toJSON().data);
	    			if (frame.command === 'TP') handleOther({node: frame.remote64, type: 'XBee868LP', module: 'Temperature', value: frame.commandData.toJSON().data[1]});
	    			if (frame.command === 'DB')
	    			{
	    				if (waiting)
	    				{
	    					waiting = false;
	    					sendData(location);
	    					setTimeout(function(){waiting=true}, 3000);
	    				}
	    				handle({node: frame.remote64, type: 'XBee868LP', module: 'RSSI', value: frame.commandData.toJSON().data[0]});
	    			}
	    			if (frame.command === 'NI') handleOther({node: frame.remote64, type: 'XBee868LP', value: String.fromCharCode.apply(String, frame.commandData.toJSON().data)});
	    			break;
	        	case 144:
	    			//console.log(JSON.parse(String.fromCharCode.apply(String, JSON.parse(JSON.stringify(frame.data)).data)));
	    			try{
	    				var cs = JSON.parse(String.fromCharCode.apply(String, frame.data.toJSON().data));
	    			}catch(e){
	    				console.log(e);
	    			}

	    			Packet.findOne(cs).exec(function createCB(err, p){
	    				if (p)
	    				{
		    				p.ack = true;
		    				p.save();
		    				console.log('Packet Saved',p);
	    					if (!sendingOld)
	    					{
	    						sendingOld = true;
			    				Packet.find({ack:false,limit:10}).exec(function createCB(err, p){

			    					setTimeout(function(){sendingOld=false}, p.length*1000);
			    					p.forEach(function(element, index){
			    						sendOldData(element,index);
			    					});

			    				});
	    					}
	    				}
	    			});
	    			break;
	        	case 145:
	    			//console.log(JSON.parse(String.fromCharCode.apply(String, JSON.parse(JSON.stringify(frame.data)).data)));
	    			try{
	    				var cs = JSON.parse(String.fromCharCode.apply(String, frame.data.toJSON().data));
	    			}catch(e){
	    				console.log(e);
	    			}

	    			Packet.findOne(cs).exec(function createCB(err, p){
	    				if (p)
	    				{
		    				p.ack = true;
		    				p.save();
		    				console.log('Packet Saved',p);
	    					if (!sendingOld)
	    					{
	    						sendingOld = true;
			    				Packet.find({ack:false}).exec(function createCB(err, p){

			    					setTimeout(function(){sendingOld=false}, p.length*1000);
			    					p.forEach(function(element, index){
			    						sendOldData(element,index);
			    					});

			    				});
	    					}
	    				}
	    			});
	    			break;
	    		default:
	    			console.log(frame);
	    			break;
	    	}
		});


	});

}, 5000);



module.exports = {
	
};

