// note, io(<port>) will create a http server for you
var io = require('socket.io')(5000);
var interval = 1000;

io.on('connection', function (socket) {
  console.log("connection made");
  var login = false;

  socket.on('login', function (msg) {
    console.log('Gateway', msg.serial, "logged in.");
    socket.gateway = msg;
    socket.gateway.lastHeartbeat = new Date();
    socket.emit('login',{success: true, interval: 1000});
    login = true;
    ping();
  });

  socket.on('ping', function (from, msg) {
    console.log('I received a ping back from', socket.gateway.serial);
    socket.gateway.lastHeartbeat = new Date();
  });

  var ping = function()
  {
  	if (login)
  	{
	  	var now = new Date();
	  	var diff = now.getTime() - socket.gateway.lastHeartbeat.getTime();
	  	if (diff > interval*3)
	  	{
	  		console.log('ALERT! No pingback');
	  	}
	  	else
	  	{
	  		socket.emit('ping',0);
	  		console.log('Timeout: ', (interval*3)-diff);
	  		setTimeout(ping, Math.max(1000,(interval*3)-diff));
	  	}
  	}
  }

  socket.on('disconnect', function () {
    console.log('user disconnected');
  });
});