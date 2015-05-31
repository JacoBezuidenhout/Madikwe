module.exports = function(req, res, next) {

  // User is allowed, proceed to the next policy, 
  // or if this is the last policy, the controller
  blueprintFind = require("../../../node_modules/sails/lib/hooks/blueprints/actions/find");

  if (req.session.authenticated) {
  		if(req.params.id){
  			found = false;
  			for (var i = req.session.user.gateways.length - 1; i >= 0; i--) {
  				if (req.session.user.gateways[i] == req.params.id){
  					found = true;
  				}
  			};

  			if(found){
	  			Gateway.findOne({id : req.params.id},function(err,gateway){
	  				Node.find({serial : gateway.nodes},function(err,nodes){
	  					if(nodes){
	  						gateway.nodes = nodes;
	  						res.ok(gateway);
	  					}else{
	  						res.forbidden('You have no nodes.');
	  					}
		  			})
	  			});
	  		}else{
	  			res.forbidden('You have no access to the Gateway.');
	  		}
		}else{
			if(!req.params.id && !req.query.id){
				Gateway.find({id : req.session.user.gateways},function(err,data){
					if(err)
						res.forbidden('You are not permitted to perform this action.');
					if(data){
						res.ok(data);
					}else{
						res.forbidden('You have no gateways.');
					}
				});
			}else{
				res.forbidden('You are not permitted to perform this action.');
			}
		}
	}else{
		res.forbidden('You are not logged in.');
	}
};