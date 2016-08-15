/*jslint node:true */
var express = require("express");
var router = express.Router();
var init = require("./init");

var ArticleModel = {
    
	voteResults: function (res, articleId) {
        "use strict";
		function query() {
			return `SELECT positive_votes, negative_votes, agg_positive_votes, agg_negative_votes
					FROM article_votes
					LEFT JOIN object_votes
					ON article_votes.legacy_id = object_votes.legacy_id
					WHERE article_id = "${articleId}"`
		}

		init.connection.query(query(articleId), function (err, rows, fields) {
				if (err) {
					throw res.json({"error": err});
				}
				res.json({'VoteResults': rows});
	  	});
	},
    
	voteHandler: function (res, article, ignObject, vote) {
        function firstQuery(){
			switch(vote) {
				case "Happy":
					return firstHappyQuery();
				    break;
				case "Sad":
					return firstSadQuery();
					break;
				default:
					console.log("Error in First Query");
					break;
			}
		};

		function secondQuery(){
			switch(vote) {
				case "Happy":
					return secondHappyQuery();
				case "Sad":
					return secondSadQuery();
				default:
					console.log("Error on Second Query");
			}
		};

		function firstHappyQuery() {
			return `INSERT INTO article_votes
					(article_id, date_time, positive_votes, negative_votes, legacy_id, article_url, article_title, article_image)
					VALUES( "${article.id}", "${article.publishDate}", 1, 0, "${article.legacyId}", "${article.url}", "${article.title}", "${article.image}")
					ON DUPLICATE KEY UPDATE
					positive_votes = positive_votes + 1;`
		};

        function firstSadQuery() {
			return `INSERT INTO article_votes
					(article_id, date_time, positive_votes, negative_votes, legacy_id, article_url, article_title, article_image)
					VALUES( "${article.id}", "${article.publishDate}", 1, 0, "${article.legacyId}", "${article.url}", "${article.title}", "${article.image}")
					ON DUPLICATE KEY UPDATE
					negative_votes = negative_votes + 1;`
		};

		function secondHappyQuery() {
			return `INSERT INTO object_votes
					(legacy_id, agg_positive_votes, agg_negative_votes, object_type, object_name, object_image)
					VALUES( "${ignObject.legacyId}", 1, 0, "${ignObject.type}", "${ignObject.name}", "${ignObject.image}")
					ON DUPLICATE KEY UPDATE
					agg_positive_votes = agg_positive_votes + 1;`
		};

		function secondSadQuery() {
			return `INSERT INTO object_votes
					(legacy_id, agg_positive_votes, agg_negative_votes, object_type, object_name, object_image)
					VALUES( "${ignObject.legacyId}", 1, 0, "${ignObject.type}", "${ignObject.name}", "${ignObject.image}"
					ON DUPLICATE KEY UPDATE
					agg_negative_votes = agg_negative_votes + 1;`
		};

		init.connection.query(firstQuery(), function(err, rows, fields) {
	  		if (err) throw res.json({"error": err})
	  		init.connection.query(secondQuery(), function(err, rows, fields) {
				if (err) throw res.json({"error": err})
	  		});
		});
		res.json({'Success': "votePlaced on " + ignObject.legacyId});
	},

	topSentiment: function(res, count, vote){
		function queryHappy(){
			return `SELECT legacy_id, SUM(positive_votes) aggPos, SUM(negative_votes) aggNeg
					FROM article_votes
					WHERE date(date_time) = current_date()
					GROUP BY legacy_id
					ORDER BY aggPos DESC
					LIMIT ${count};`
		}

		function querySad(){
			return `SELECT legacy_id, SUM(positive_votes) aggPos, SUM(negative_votes) aggNeg
					FROM article_votes
					WHERE date(date_time) = current_date()
					GROUP BY legacy_id
					ORDER BY aggNeg DESC
					LIMIT ${count};`
		}

		switch(vote) {
			case "Happy":
				init.connection.query(queryHappy(), function(err, rows, fields) {
					if (err) throw res.json({"error": err})
					res.json({'Success': rows})
		  		});
		  		break;	
			case "Sad":
				init.connection.query(querySad(), function(err, rows, fields) {
					if (err) throw res.json({"error": err})
					res.json({'Success': rows})
		  		});
		}
	},

<<<<<<< HEAD
	graphInfo: function(res, legacyID, objectTitle, coverArt){
		function query(legacyID){
			return "SELECT agg_positive_votes, agg_negative_votes\
					FROM object_votes\
					WHERE legacy_id = '" + legacyID + "';"
=======
	graphInfo: function(res, legacyID){
		function query(){
			return `SELECT agg_positive_votes, agg_negative_votes
					FROM object_votes
					WHERE legacy_id = "${legacyID}";`
>>>>>>> 033d8b072c38658380fcd77a76bd4da02db5ea61

		}

		function getSentimentPercent(posVotes, negVotes){
			return Math.floor(posVotes / (posVotes+negVotes)*100);
		}

		init.connection.query(query(), function(err, rows, fields) {
				if (err) throw res.json({"error": err})
				var sentimentVal = getSentimentPercent(rows[0].agg_positive_votes, rows[0].agg_negative_votes);
				console.log(sentimentVal)
				res.json({'overallSentiment': sentimentVal, 'objectTitle': objectTitle, 'coverArt': coverArt})
	  		});
	}

}

module.exports.ArticleModel = ArticleModel;