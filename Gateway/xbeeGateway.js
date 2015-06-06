/*

	Data expected:
		TEMP
		BAT
		A0-2
		D0-5
		TrackerData

	send({node: serial, type: 'XBee868LP', module: TEMPERATURE, value: 23});

*/

var socket;

var util = require('util');
var settings = require('./settings');

var SerialPort = require('serialport').SerialPort;
var xbee_api = require('xbee-api');
var lzwCompress = require('lzwcompress');

var C = xbee_api.constants;
 
var xbeeAPI = new xbee_api.XBeeAPI({
  api_mode: 1
});
 
var serialport = new SerialPort(settings.XBeePort, {
  baudrate: 9600,
  parser: xbeeAPI.rawParser()
});

serialport.on("open", function() {

var broadcast = function(cmd,val)
{
	serialport.write(xbeeAPI.buildFrame(
		{
		    type: C.FRAME_TYPE.REMOTE_AT_COMMAND_REQUEST,
		    command: cmd,
		    commandParameter: val,
		}
	));
}

var sendData = function(data,id)
{
	serialport.write(xbeeAPI.buildFrame(
		{
		    type: 0x00, // xbee_api.constants.FRAME_TYPE.TX_REQUEST_64  
		    destination64: id,
		    data:  JSON.stringify(data)// Can either be string or byte array. 
		}
	));
	console.log('Sending',id,data);
}
	
	console.log('Serial Open');
	socket = require('socket.io-client')('http://localhost:5000');

	console.log("Connecting...");

	socket.on('connect', function(){
		console.log("Connection Successful");
		setInterval(
		function(){
			setTimeout(broadcast('NI',[]), Math.random(5000));
			setTimeout(broadcast('TP',[]), Math.random(5000));
			setTimeout(broadcast('DB',[]), Math.random(5000));
		}, 60000);

		// var lat = -26;
		// var lon = 28;
		
		// setInterval(
		// function(){
		// 	lat += (Math.random()*2-1);
		// 	lon += (Math.random()*2-1);
		// 	socket.emit('gps',{color: "#0000ff", node:['TrackerA','TrackerB','TrackerC','TrackerD','TrackerE','TrackerF'][Math.floor(Math.random()*4)],type:'EdisonTracker',lat:lat,lon:lon})
		// }, Math.round(Math.random()*3000));
	});

	socket.on('settings', function(data){
		console.log("New Settings",data);
	});

	socket.on('cmd', function(data){
		console.log("CMD",data);		
		var frame_obj = {
		    type: C.FRAME_TYPE.AT_COMMAND,
		    command: data.cmd,
		    commandParameter: [],
		};
		 
		serialport.write(xbeeAPI.buildFrame(frame_obj));	
	});

	socket.on('data', function(data){
		console.log("DATA",data);
	});


	socket.on('disconnect', function(){
		console.log("Disconnected");
	});

	xbeeAPI.on("frame_object", function(frame) {
	    // console.log(">>", frame);
    	var result = [];
    	switch(frame.type){
    		case 146:
    			if (typeof frame.analogSamples.AD1 !== 'undefined')		socket.emit("data",{node: frame.remote64, type: 'XBee868LP', module: 'BatteryA1', value: frame.analogSamples.AD1});
    			if (typeof frame.analogSamples.AD2 !== 'undefined')		socket.emit("data",{node: frame.remote64, type: 'XBee868LP', module: 'ADC2', value: frame.analogSamples.AD2});
    			if (typeof frame.digitalSamples.DIO0 !== 'undefined') 	
    			{
    				socket.emit("data",{node: frame.remote64, type: 'XBee868LP', module: 'DIO0', value: frame.digitalSamples.DIO0});
    				socket.emit("alert",{node: frame.remote64, type: 'XBee868LP', module: 'DIO0', value: frame.digitalSamples.DIO0});
    			}
    			if (typeof frame.digitalSamples.DIO1 !== 'undefined') 	
    			{
    				socket.emit("data",{node: frame.remote64, type: 'XBee868LP', module: 'DIO1', value: frame.digitalSamples.DIO1});
    				socket.emit("alert",{node: frame.remote64, type: 'XBee868LP', module: 'DIO1', value: frame.digitalSamples.DIO1});
    			}
    			if (typeof frame.digitalSamples.DIO2 !== 'undefined') 	
    			{
    				socket.emit("data",{node: frame.remote64, type: 'XBee868LP', module: 'DIO2', value: frame.digitalSamples.DIO2});
    				socket.emit("alert",{node: frame.remote64, type: 'XBee868LP', module: 'DIO2', value: frame.digitalSamples.DIO2});
    			}
    			if (typeof frame.digitalSamples.DIO3 !== 'undefined') 	
    			{
    				socket.emit("data",{node: frame.remote64, type: 'XBee868LP', module: 'DIO3', value: frame.digitalSamples.DIO3});
    				socket.emit("alert",{node: frame.remote64, type: 'XBee868LP', module: 'DIO3', value: frame.digitalSamples.DIO3});
    			}
    			if (typeof frame.digitalSamples.DIO4 !== 'undefined') 	
    			{
    				socket.emit("data",{node: frame.remote64, type: 'XBee868LP', module: 'DIO4', value: frame.digitalSamples.DIO4});
    				socket.emit("alert",{node: frame.remote64, type: 'XBee868LP', module: 'DIO4', value: frame.digitalSamples.DIO4});
    			}
    			if (typeof frame.digitalSamples.DIO5 !== 'undefined') 	
    			{
    				socket.emit("data",{node: frame.remote64, type: 'XBee868LP', module: 'DIO5', value: frame.digitalSamples.DIO5});
    				socket.emit("alert",{node: frame.remote64, type: 'XBee868LP', module: 'DIO5', value: frame.digitalSamples.DIO5});
    			}
    			break;
    		case 151:
    			// console.log(frame.commandData.toJSON().data);
    			if (frame.command === 'TP') socket.emit("data",{node: frame.remote64, type: 'XBee868LP', module: 'Temperature', value: frame.commandData.toJSON().data[1]});
    			if (frame.command === 'DB') socket.emit("data",{node: frame.remote64, type: 'XBee868LP', module: 'RSSI', value: frame.commandData.toJSON().data[0]});
    			if (frame.command === 'NI') socket.emit("NI",{node: frame.remote64, type: 'XBee868LP', value: String.fromCharCode.apply(String, frame.commandData.toJSON().data)});
    			break;
        	case 144:
    			// console.log(JSON.parse(String.fromCharCode.apply(String, JSON.parse(JSON.stringify(frame.data)).data)));
    			var data = JSON.parse(String.fromCharCode.apply(String, frame.data.toJSON().data));
    			data.tracker = frame.remote64;
    			socket.emit('gps',data);
    			sendData({cs:data.cs},data.tracker);
    			break;
    		default:
	    		socket.emit('frame',frame);
    			// console.log(frame);
    			break;
    	}
	    // frame.commandData = frame.commandData.toJSON();

		
		// socket.emit("data",{node: frame.remote64, type: 'XBee868LP', module: 'TEMPERATURE', value: 23});
	});


});