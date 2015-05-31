/**
 * NodeController
 *
 * @description :: Server-side logic for managing nodes
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
	byGateway : function(req,res)
	{
		var params = req.params.all();
		console.log(params);
									
		Datapoint.native(function(err,collection){
	    	collection.aggregate([
	    		{ "$match": { "gateway":  params.serial} },
	    		{ "$group": { "_id": '$node',  type: {$last : "$type"}, modules: {$addToSet : "$module"}, last : {$last: "$createdAt"}}}
	    		],
	    	function(err,docs) {
				res.json(docs);
	       	});
	   	});     	
	}
};

