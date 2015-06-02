/**
 * MapController
 *
 * @description :: Server-side logic for managing maps
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var trackers = ['TrackerA','TrackerB','TrackerC','TrackerD','TrackerE','TrackerF'];

module.exports = {
	line : function(req,res)
	{
		var base = {
		  "type": "FeatureCollection",
		  "features": []
		};
		Map.find({limit:10},function(err,collection){
			base.features = collection;
			res.json(base);
		});
	
	},
	last : function(req,res)
	{
		var base = {
		  "type": "FeatureCollection",
		  "features": []
		};
		Map.find({limit:10},function(err,collection){
			base.features = collection;
			res.json(base);
		});
	
	},
	all : function(req,res)
	{
		for (var i = 0; i < trackers.length; i++) 
		{		
			Map.find({serial: trackers[i],limit:5},function(err,collection)
			{	
				var line = {
				  "type": "FeatureCollection",
				  "features": []
				};
				
				line.features = collection;
				Map.publishCreate({id:-1,data:line});
			});
		}
		res.json({'success':true});
	} 
};

