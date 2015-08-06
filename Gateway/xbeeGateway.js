/*

	Data expected:
		TEMP
		BAT
		A0-2
		D0-5
		TrackerData

	send({node: serial, type: 'XBee868LP', module: TEMPERATURE, value: 23});

*/

try
{

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
  baudrate: 9600
//parser: serialport.parsers.readline("\n")
  // parser: xbeeAPI.rawParser()
});

if (settings.debug) console.log('Settings Loaded',settings);

serialport.on("open", function() {

    var line = [];
    
    serialport.on("data",function(buffer){
        for (var i =0; i< buffer.length; i++)
        {
            if (buffer[i] == new Buffer('~')[0])
            {

try
                {

                    if (line.length > 0)
                    { 
                        console.log('New Packet',new Buffer(line), xbeeAPI.canParse(new Buffer(line)));
                        if (xbeeAPI.canParse(new Buffer(line)))
                        {
                            console.log(xbeeAPI.parseFrame(new Buffer(line)));
                        }
                    }

                }
                catch(e)
                {
                    console.log(e);
                }

                line = [];
            }
            line.push(buffer[i]);
        }
    });

var broadcast = function(cmd,val)
{
	if (settings.debug) console.log('Broadcasting',cmd,val);
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
	if (settings.debug) console.log('Sending',id,data);
	serialport.write(xbeeAPI.buildFrame(
		{
		    type: 0x00, // xbee_api.constants.FRAME_TYPE.TX_REQUEST_64  
		    destination64: id,
		    data:  JSON.stringify(data)// Can either be string or byte array. 
		}
	));
}
	
	if (settings.debug) console.log('Serial Open');
	socket = require('socket.io-client')('http://localhost:5000');

	console.log("Connecting...");

	socket.on('connect', function(){
		if (settings.debug) console.log("Connection Successful\n\nStarting Intervals");
		setInterval(
		function(){
			setTimeout(broadcast('NI',[]), Math.round(Math.random()*5000));
			setTimeout(broadcast('TP',[]), Math.round(Math.random()*5000));
            setTimeout(broadcast('DB',[]), Math.round(Math.random()*5000));
            setTimeout(broadcast('IR',new Buffer([0xFF,0xFF])), Math.round(Math.random()*5000));
			setTimeout(broadcast('D1',new Buffer([0x02])), Math.round(Math.random()*5000));
		}, 20000);

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
		if (settings.debug) console.log("CMD\n",data);		
		var frame_obj = {
		    type: C.FRAME_TYPE.AT_COMMAND,
		    command: data.cmd,
		    commandParameter: [],
		};
		 
		serialport.write(xbeeAPI.buildFrame(frame_obj));	
	});

	socket.on('data', function(data){
		if (settings.debug) console.log("DATA",data);
	});


	socket.on('disconnect', function(){
		if (settings.debug) console.log("Disconnected");
	});

	xbeeAPI.on("frame_object", function(frame) {
	    if (settings.debug) console.log("New Frame >>\n", frame);
    	var result = [];
	try {

    	switch(frame.type){
    		case 146:
    			if (typeof frame.analogSamples.AD1 !== 'undefined')		socket.emit("data",{node: frame.remote64, type: 'XBee868LP', module: 'BatteryA1', value: frame.analogSamples.AD1});
    			if (typeof frame.analogSamples.AD2 !== 'undefined')		socket.emit("data",{node: frame.remote64, type: 'XBee868LP', module: 'ADC2', value: frame.analogSamples.AD2});
    			//comm button
    			if (typeof frame.digitalSamples.DIO0 !== 'undefined') 	
    			{
    				socket.emit("data",{node: frame.remote64, type: 'XBee868LP', module: 'BTN0', value: frame.digitalSamples.DIO0});
    				// socket.emit("alert",{node: frame.remote64, type: 'XBee868LP', module: 'BTN0', value: frame.digitalSamples.DIO0});
    			}
    			//ADC1
    			if (typeof frame.digitalSamples.DIO1 !== 'undefined') 	
    			{
    				socket.emit("data",{node: frame.remote64, type: 'XBee868LP', module: 'BTN1', value: frame.digitalSamples.DIO1});
    				socket.emit("alert",{node: frame.remote64, type: 'XBee868LP', module: 'BTN1', value: frame.digitalSamples.DIO1});
    			}
    			if (typeof frame.digitalSamples.DIO2 !== 'undefined') 	
    			{
    				socket.emit("data",{node: frame.remote64, type: 'XBee868LP', module: 'LINE1', value: frame.digitalSamples.DIO2});
    				socket.emit("alert",{node: frame.remote64, type: 'XBee868LP', module: 'LINE1', value: frame.digitalSamples.DIO2});
    			}
    			if (typeof frame.digitalSamples.DIO3 !== 'undefined') 	
    			{
    				socket.emit("data",{node: frame.remote64, type: 'XBee868LP', module: 'LINE2', value: frame.digitalSamples.DIO3});
    				socket.emit("alert",{node: frame.remote64, type: 'XBee868LP', module: 'LINE2', value: frame.digitalSamples.DIO3});
    			}
    			if (typeof frame.digitalSamples.DIO4 !== 'undefined') 	
    			{
    				socket.emit("data",{node: frame.remote64, type: 'XBee868LP', module: 'LINE3', value: frame.digitalSamples.DIO4});
    				socket.emit("alert",{node: frame.remote64, type: 'XBee868LP', module: 'LINE3', value: frame.digitalSamples.DIO4});
    			}
    			//accoc led
    			if (typeof frame.digitalSamples.DIO5 !== 'undefined') 	
    			{
    				socket.emit("data",{node: frame.remote64, type: 'XBee868LP', module: 'BTN2', value: frame.digitalSamples.DIO5});
    				socket.emit("alert",{node: frame.remote64, type: 'XBee868LP', module: 'BTN2', value: frame.digitalSamples.DIO5});
    			}
    			if (typeof frame.digitalSamples.DIO6 !== 'undefined') 	
    			{
    				socket.emit("data",{node: frame.remote64, type: 'XBee868LP', module: 'LINE4', value: frame.digitalSamples.DIO6});
    				socket.emit("alert",{node: frame.remote64, type: 'XBee868LP', module: 'LINE4', value: frame.digitalSamples.DIO6});
    			}
    			if (typeof frame.digitalSamples.DIO7 !== 'undefined') 	
    			{
    				socket.emit("data",{node: frame.remote64, type: 'XBee868LP', module: 'LINE5', value: frame.digitalSamples.DIO7});
    				socket.emit("alert",{node: frame.remote64, type: 'XBee868LP', module: 'LINE5', value: frame.digitalSamples.DIO7});
    			}
    			break;
    		case 151:
    			if (settings.debug) console.log(frame.commandData.toJSON());
    			if (frame.command === 'TP') socket.emit("data",{node: frame.remote64, type: 'XBee868LP', module: 'Temperature', value: frame.commandData.toJSON()[1]});
    			if (frame.command === 'DB') socket.emit("data",{node: frame.remote64, type: 'XBee868LP', module: 'RSSI', value: frame.commandData.toJSON()[0]});
    			if (frame.command === 'NI') socket.emit("NI",{node: frame.remote64, type: 'XBee868LP', value: String.fromCharCode.apply(String, frame.commandData.toJSON())});
    			break;
        	case 144:
	    		socket.emit('frame',frame);
                if (settings.debug) console.log("FRAME",frame);
                if (settings.debug) console.log("GPS",frame.data.toString('utf-8'));

    			// if (settings.debug) console.log(String.fromCharCode.apply(String, JSON.parse(JSON.stringify(frame.data)).data));
    			// var data = (String.fromCharCode.apply(String, frame.data.toJSON().data));
                // console.log('GPS',data);  
//  			data.tracker = frame.remote64;
//	    		socket.emit('frame',frame);
//    			socket.emit('gps',data);
//    			sendData({cs:data.cs},data.tracker);
    			break;
        	case 145:
	    		socket.emit('frame',frame);
    			if (settings.debug) console.log(JSON.parse(String.fromCharCode.apply(String, JSON.parse(JSON.stringify(frame.data)).data)));
    			var data = JSON.parse(String.fromCharCode.apply(String, frame.data.toJSON().data));
    			data.tracker = frame.remote64;
    			socket.emit('gps',data);
//	    		socket.emit('frame',frame);
    			sendData({cs:data.cs},data.tracker);
    			break;
    		default:
//	    		socket.emit('frame',frame);
    			if (settings.debug) console.log(frame);
    			break;
    	}
	}
catch (e)
{
console.log(e);
}
	    // frame.commandData = frame.commandData.toJSON();

		
		// socket.emit("data",{node: frame.remote64, type: 'XBee868LP', module: 'TEMPERATURE', value: 23});
	});


});

}
catch (e)
{
    console.log('GLOBAL',e);
}
