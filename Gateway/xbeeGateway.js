/*

	Data expected:
		TEMP
		BAT
		A0-2
		D0-5
		TrackerData

*/

var socket = require('socket.io-client')('http://localhost:5000');

console.log("Connecting...");

socket.on('connect', function(){
	console.log("Connection Successful");
});


setInterval(function(){
	socket.emit("data",{T:25});
}, 1000);


socket.on('settings', function(data){
	console.log("New Settings",data);
});

socket.on('cmd', function(data){
	console.log("CMD",data);			
});

socket.on('data', function(data){
	console.log("DATA",data);
});


socket.on('disconnect', function(){
	console.log("Disconnected");
});