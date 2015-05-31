var defaultGateway = 'asdf'

var User = {

	  connection: 'someMongodbServer',
  // Enforce model schema in the case of schemaless databases
  schema: true,

  attributes: {
    username  : { type: 'string', unique: true },
    email     : { type: 'email',  unique: true },
    passports : { collection: 'Passport', via: 'user' },
    gateways : { type: 'array' ,defaultsTo: defaultGateway}
  }
};

module.exports = User;
