/**
 * GpsController
 *
 * @description :: Server-side logic for managing gps
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var location = {lat:0,lon:0,speed:-1,heading:0,altitude:0};
var serialgps = require('serialgps');
var util = require('util');
var SerialPort = require('serialport').SerialPort;
var xbee_api = require('xbee-api');
var C = xbee_api.constants;
var xbeeAPI = new xbee_api.XBeeAPI({
  api_mode: 1
});

//create a new instance. arguments are serial port and baud rate
setTimeout(function(){
	var g = new serialgps('COM10',9600);
//monitor for data
	var count = 0;
	g.on('data', function(data) {
		if (data.sentence == 'RMC')
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
	      if (data.sentence == 'GGA')
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
	      	if (data.sentence == 'VTG')
	      	{
	      			location.speed = data.speedKmph;
	      			location.heading = data.trackTrue;
	    	}

	    Gps.create({GPSData:data,location: location}).exec(function createCB(err, created){
		  // console.log(created);
		  count++;
		  	if (count > 5)
		  	{
		 		Gps.publishCreate(created);
				count = 0;
			}
		});
	});

	var serialport = new SerialPort("COM7", {
	  baudrate: 9600,
	  parser: xbeeAPI.rawParser()
	});

	serialport.on("open", function() 
	{
		var handle = function(data)
		{
			console.log(data,location);
		}

		var sendData = function(data)
		{
			serialport.write(xbeeAPI.buildFrame(
				{
				    type: 0x00, // xbee_api.constants.FRAME_TYPE.TX_REQUEST_64  
				    destination64: "000000000000FFFF",
				    options: 0x00, // optional, 0x00 is default 
				    data:  JSON.stringify(data)// Can either be string or byte array. 
				}
			));
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
			setTimeout(function(){
				broadcast('DB',[]);
			}, 1000);
		}

		setTimeout(function(){
			broadcast('DB',[]);
		}, 1000);
		
		console.log('Serial Open');

		xbeeAPI.on("frame_object", function(frame) {
		    console.log(">>", frame);
	    	switch(frame.type){
	    		case 146:
	    			if (typeof frame.analogSamples.AD1 !== 'undefined')		handle({node: frame.remote64, type: 'XBee868LP', module: 'BatteryA1', value: frame.analogSamples.AD1});
	    			if (typeof frame.analogSamples.AD2 !== 'undefined')		handle({node: frame.remote64, type: 'XBee868LP', module: 'ADC2', value: frame.analogSamples.AD2});
	    			if (typeof frame.digitalSamples.DIO0 !== 'undefined') 	handle({node: frame.remote64, type: 'XBee868LP', module: 'DIO0', value: frame.digitalSamples.DIO0});
	    			if (typeof frame.digitalSamples.DIO1 !== 'undefined') 	handle({node: frame.remote64, type: 'XBee868LP', module: 'DIO1', value: frame.digitalSamples.DIO1});
	    			if (typeof frame.digitalSamples.DIO2 !== 'undefined') 	handle({node: frame.remote64, type: 'XBee868LP', module: 'DIO2', value: frame.digitalSamples.DIO2});
	    			if (typeof frame.digitalSamples.DIO3 !== 'undefined') 	handle({node: frame.remote64, type: 'XBee868LP', module: 'DIO3', value: frame.digitalSamples.DIO3});
	    			if (typeof frame.digitalSamples.DIO4 !== 'undefined') 	handle({node: frame.remote64, type: 'XBee868LP', module: 'DIO4', value: frame.digitalSamples.DIO4});
	    			if (typeof frame.digitalSamples.DIO5 !== 'undefined') 	handle({node: frame.remote64, type: 'XBee868LP', module: 'DIO5', value: frame.digitalSamples.DIO5});
	    			break;
	    		case 151:
	    			console.log(frame.commandData.toJSON().data);
	    			if (frame.command === 'TP') handle({node: frame.remote64, type: 'XBee868LP', module: 'Temperature', value: frame.commandData.toJSON().data[1]});
	    			if (frame.command === 'DB')
	    			{
	    				sendData(location);
	    				handle({node: frame.remote64, type: 'XBee868LP', module: 'RSSI', value: frame.commandData.toJSON().data[0]});
	    			}
	    			if (frame.command === 'NI') handle({node: frame.remote64, type: 'XBee868LP', value: String.fromCharCode.apply(String, frame.commandData.toJSON().data)});
	    			break;
	        	case 144:
	    			console.log(JSON.parse(String.fromCharCode.apply(String, JSON.parse(JSON.stringify(frame.data)).data)));
	    			var cs = JSON.parse(String.fromCharCode.apply(String, frame.data.toJSON().data));
	    			cs.node = frame.remote64;
	    			cs.type = 'Intel Edison Tracker';
	    			handle(cs);
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

