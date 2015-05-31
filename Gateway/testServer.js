var io = require('socket.io')(5000);

io.on('connection', function (socket) 
{
  console.log("New Connection Made");

  socket.on('data', function (msg) {
    console.log(msg);
  });

  socket.on('disconnect', function () {
    console.log('user disconnected');
  });

});