/**
* Gateway.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  connection: 'someMongodbServer',

  attributes: {
  	serial :
  	{
  		type : "string"
  	},

  	type :
  	{
  		type : "string",
  		required : true
  	},

    settings :
    {
      type: "json"
    },

    nodes :
    {
      type: "array",
      defaultsTo: []
    },

    modules :
    {
      type: "array",
      defaultsTo: []
    }

    // apiCount :
    // {
    //   type: "number",
    //   defaultsTo: 0
    // }
  }
};

