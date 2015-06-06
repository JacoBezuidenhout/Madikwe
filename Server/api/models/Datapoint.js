/**
* Datapoint.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {
  	migrate: 'safe',
  	connection: 'someMongodbServer',
  	attributes: {
  		gateway: {
  			type: 'string'
  		},
  		node: {
  			type: 'string'
  		},
  		module: {
  			type: 'string'
  		}
  }
};
