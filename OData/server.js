var odata = require('node-odata');
 
var server = odata('mongodb://localhost/sails');
 
server.resources.register({
    url: '/datapoint',
    model: {
        node: String,
        type: String,
        module: String,
        gateway: String,
        value: Number
    }
});
 
server.listen(3000);
