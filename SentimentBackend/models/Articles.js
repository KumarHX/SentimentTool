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

	voteHandler: function(res, articleId, votePlaced, dateTime, legacyId, objectType, objectName, objectImage, articleURL, articleTitle, articleImage){
		function firstQuery(articleId, dateTime, legacyId, value, articleURL, articleTitle, articleImage){
			var first = "";
			if(value == "Happy")
			{
				first = firstHappyQuery(articleId, dateTime, legacyId, articleURL, articleTitle, articleImage);
			}
			else if(value == "Sad")
			{
				first = firstSadQuery(articleId, dateTime, legacyId, articleURL, articleTitle, articleImage);
			}
			return first;
		}

		function secondQuery(articleId, value, objectType, objectName, objectImage){
			var second = "";
			if(value == "Happy")
			{
				second = secondHappyQuery(articleId, objectType, objectName, objectImage);
			}
			else if(value == "Sad")
			{
				second = secondSadQuery(legacyId);
			}
			return second;
		}

		function firstHappyQuery(articleId, dateTime, legacyId, article_url, article_title, article_image)
		{
			return "INSERT INTO article_votes\
					(article_id, date_time, positive_votes, negative_votes, legacy_id, article_url, article_title, article_image)\
					VALUES( '" + articleId + "', '" + dateTime + "', 1, 0, '" + legacyId + "', '" + article_url + "', '" + article_title + "', '" + article_image + "')\
					ON DUPLICATE KEY UPDATE\
					positive_votes = positive_votes + 1;"
		}

		function firstSadQuery(articleId, dateTime, legacyId, article_url, article_title, article_image)
		{
			return "INSERT INTO article_votes\
					(article_id, date_time, positive_votes, negative_votes, legacy_id, article_url, article_title, article_image)\
					VALUES( '" + articleId + "', '" + dateTime + "', 1, 0, '" + legacyId + "', '" + article_url + "', '" + article_title + "', '" + article_image + "')\
					ON DUPLICATE KEY UPDATE\
					negative_votes = negative_votes + 1;"
		}

		function secondHappyQuery(articleId, objectType, objectName, objectImage)
		{
			return "INSERT INTO object_votes\
					(legacy_id, agg_positive_votes, agg_negative_votes, object_type, object_name, object_image)\
					VALUES( '" + articleId + "', 1, 0, '" + objectType + "', '" + objectName + "', '" + objectImage + "')\
					ON DUPLICATE KEY UPDATE\
					agg_positive_votes = agg_positive_votes + 1;"
		}

		function secondSadQuery(legacyId)
		{
			return "INSERT INTO object_votes\
					(legacy_id, agg_positive_votes, agg_negative_votes, object_type, object_name, object_image)\
					VALUES( '" + articleId + "', 1, 0, '" + objectType + "', '" + objectName + "', '" + objectImage + "')\
					ON DUPLICATE KEY UPDATE\
					agg_negative_votes = agg_negative_votes + 1;"
		}

		init.connection.query(firstQuery(articleId, dateTime, legacyId, votePlaced, articleURL, articleTitle, articleImage), function(err, rows, fields) {
	  		if (err) throw res.json({"error": err})
	  		init.connection.query(secondQuery(articleId, votePlaced, objectType, objectName, objectImage), function(err, rows, fields) {
				if (err) throw res.json({"error": err})
	  		});
		});
		res.json({'Success': votePlaced + " on " + legacyId});
	},

	topSentiment: function(res, count, feeling){
		function queryHappy(count){
			return "SELECT legacy_id, SUM(positive_votes) aggPos, SUM(negative_votes) aggNeg\
					FROM article_votes\
					WHERE date(date_time) = current_date()\
					GROUP BY legacy_id\
					ORDER BY aggPos DESC\
					LIMIT " + count +";"
		}

		function querySad(count){
			return "SELECT legacy_id, SUM(positive_votes) aggPos, SUM(negative_votes) aggNeg\
					FROM article_votes\
					WHERE date(date_time) = current_date()\
					GROUP BY legacy_id\
					ORDER BY aggNeg DESC\
					LIMIT " + count +";"
		}
		if(feeling == "Happy")
		{
			init.connection.query(queryHappy(count), function(err, rows, fields) {
					if (err) throw res.json({"error": err})
					res.json({'Success': rows})
		  		});
		}
		else if(feeling == "Sad")
		{
			init.connection.query(querySad(count), function(err, rows, fields) {
					if (err) throw res.json({"error": err})
					res.json({'Success': rows})
		  		});
		}

	},

	graphInfo: function(res, legacyID){
		function query(legacyID){
			return "SELECT agg_positive_votes, agg_negative_votes\
					FROM object_votes\
					WHERE legacy_id = '" + legacyID + "';"

		}

		function getSentimentPercent(posVotes, negVotes){
			return Math.floor(posVotes / (posVotes+negVotes)*100);
		}

		init.connection.query(query(legacyID), function(err, rows, fields) {
				if (err) throw res.json({"error": err})
				var sentimentVal = getSentimentPercent(rows[0].agg_positive_votes, rows[0].agg_negative_votes);
				console.log(sentimentVal)
				res.json({'sentiment Value': sentimentVal})
	  		});
	}

}

module.exports.ArticleModel = ArticleModel;












