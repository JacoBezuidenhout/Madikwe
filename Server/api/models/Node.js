/**
* Node.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/
var defaultSettings = [
  {module: 'All', key: 'Delta', value: [{key: 'Time', value: 60},{key: 'Value', value: 2}]},
  {module: 'All', key: 'Safe', value: [{key: 'Max', value: 60},{key: 'Min', value: 2}]},
  {module: 'All', key: 'Extreme', value: [{key: 'Max', value: 100},{key: 'Min', value: -40}]}
];

module.exports = {

  connection: 'someMongodbServer',

  attributes: {
    serial: {
      type: 'string',
      unique: true
    },
    type: {
      type: 'string'
    },
    // apiCount: {
    //   type: 'number'
    // },
  	settings: {
  		type: 'json',
      defaultsTo: defaultSettings
  	}
  }
};

