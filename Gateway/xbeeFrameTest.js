var xbee_api = require('xbee-api');
var C = xbee_api.constants;
var xbeeAPI = new xbee_api.XBeeAPI();

var raw_frame = new Buffer([0x7E, 0x00, 0x11, 0x17, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xFF, 0xFF, 0xFF, 0xFE, 0x02, 0x44, 0x31, 0x02, 0x73]);
console.log(xbeeAPI.parseFrame(raw_frame));