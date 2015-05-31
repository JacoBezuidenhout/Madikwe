module.exports = function(req, res, next) {

  // User is allowed, proceed to the next policy, 
  // or if this is the last policy, the controller
  blueprintFind = require("../../../node_modules/sails/lib/hooks/blueprints/actions/find");

  if (req.session.authenticated) {
		Gateway.find({serial : ['1234','asdf']},function(err,data){
			if (err || !data)
		  		return res.forbidden('You are not permitted to perform this action.');
		  	if(!data)
		  		return res.forbidden('You have no gateways.');
		  	if(!req.params.id && !req.query.id)
		  	{
		  		res.ok(data);
		  	}else{
		  		return res.forbidden('You are not permitted to perform this action.');
		  	}
		})
	}
};