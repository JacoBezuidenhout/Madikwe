var net = require('net');

var HOST = 'mtggroup.co';
var PORT = 8000;

var client = new net.Socket();
client.connect(PORT, HOST, function() {

    console.log('CONNECTED TO: ' + HOST + ':' + PORT);
    // Write a message to the socket as soon as the client is connected, the server will receive it as message from the client 
    client.write(JSON.stringify({serial:"EDISON0123",type:"asdf"}));

});

// Add a 'data' event handler for the client socket
// data is what the server sent to this socket
client.on('data', function(data) {
    
    console.log('DATA: ' + data);
    client.write(JSON.stringify(data));
    // Close the client socket completely
    // client.destroy();
    
});

// Add a 'close' event handler for the client socket
client.on('error', function() {
    console.log('Error. Connection closed');
});
// Add a 'close' event handler for the client socket
client.on('close', function() {
    console.log('Connection closed');
});
