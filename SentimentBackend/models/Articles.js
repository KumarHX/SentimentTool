var express = require('express');
var router = express.Router();
var init = require("./init")

ArticleModel = {

	voteResults: function(res, articleId){
		function query(articleId){
			return "SELECT positive_votes, negative_votes, agg_positive_votes, agg_negative_votes\
					FROM article_votes\
					LEFT JOIN object_votes\
					ON article_votes.legacy_id = object_votes.legacy_id\
					WHERE article_id = '" + articleId + "';"
		}

		init.connection.query(query(articleId), function(err, rows, fields) {
				if (err) throw res.json({"error": err})
				res.json({'Success': rows})
	  		});

	},

	voteHandler: function(res, articleId, votePlaced, dateTime, legacyId){
		function firstQuery(articleId, dateTime, legacyId, value){
			var first = "";
			if(value == "Happy")
			{
				first = firstHappyQuery(articleId, dateTime, legacyId);
			}
			else if(value == "Sad")
			{
				first = firstSadQuery(articleId, dateTime, legacyId);
			}
			return first;
		}

		function secondQuery(legacyId, value){
			var second = "";
			if(value == "Happy")
			{
				second = secondHappyQuery(legacyId);
			}
			else if(value == "Sad")
			{
				second = secondSadQuery(legacyId);
			}
			return second;
		}

		function firstHappyQuery(articleId, dateTime, legacyId)
		{
			return "INSERT INTO article_votes\
					(article_id, date_time, positive_votes, negative_votes, legacy_id)\
					VALUES( '" + articleId + "', '" + dateTime + "', 1, 0, '" + legacyId + "')\
					ON DUPLICATE KEY UPDATE\
					positive_votes = positive_votes + 1;"
		}

		function firstSadQuery(articleId, dateTime, legacyId)
		{
			return "INSERT INTO article_votes\
                    (article_id, date_time, positive_votes, negative_votes, legacy_id)\
					VALUES( '" + articleId + "', '" + dateTime + "', 0, 1, '" + legacyId + "')\
					ON DUPLICATE KEY UPDATE\
					negative_votes = negative_votes + 1;"

		}

		function secondHappyQuery(legacyId)
		{
			return "INSERT INTO object_votes\
					(legacy_id, agg_positive_votes, agg_negative_votes)\
					VALUES( '" + legacyId + "', 1, 0)\
					ON DUPLICATE KEY UPDATE\
					agg_positive_votes = agg_positive_votes + 1;"
		}

		function secondSadQuery(legacyId)
		{
			return "INSERT INTO object_votes\
					(legacy_id, agg_positive_votes, agg_negative_votes)\
					VALUES( '" + legacyId + "', 0, 1)\
					ON DUPLICATE KEY UPDATE\
					agg_negative_votes = agg_negative_votes + 1;"
		}

		init.connection.query(firstQuery(articleId, dateTime, legacyId, votePlaced), function(err, rows, fields) {
	  		if (err) throw res.json({"error": err})
	  		init.connection.query(secondQuery(legacyId, votePlaced), function(err, rows, fields) {
				if (err) throw res.json({"error": err})
	  		});
		});
		res.json({'Success': "Database updated"});
	}
}

module.exports.ArticleModel = ArticleModel;

















