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
				case "Sad":
					return firstSadQuery();
				default:
					console.log("Vote does not match a valid emotion");
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
					console.log("Vote does not match a valid emotion");
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
					VALUES( "${article.id}", "${article.publishDate}", 0, 1, "${article.legacyId}", "${article.url}", "${article.title}", "${article.image}")
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
					VALUES( "${ignObject.legacyId}", 0, 1, "${ignObject.type}", "${ignObject.name}", "${ignObject.image}")
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

	graphInfo: function(res, legacyID, objectTitle, coverArt){
		var weekday = new Array(7);
		weekday[0]=  "Sunday";
		weekday[1] = "Monday";
		weekday[2] = "Tuesday";
		weekday[3] = "Wednesday";
		weekday[4] = "Thursday";
		weekday[5] = "Friday";
		weekday[6] = "Saturday";

		function query(){
			return `SELECT agg_positive_votes, agg_negative_votes
					FROM object_votes
					WHERE legacy_id = "${legacyID}";`
		}

		function getSentimentPercent(posVotes, negVotes){
 			return Math.floor(posVotes / (posVotes+negVotes)*100);
 		}

		function queryDataPoints(legacyID){
			return `SELECT SUM(positive_votes) as posVotes, SUM(negative_votes) as negVotes, date_time
					FROM article_votes
					WHERE date_time >= DATE_ADD(CURDATE(), INTERVAL -7 DAY) AND
					legacy_id = "${legacyID}"
					GROUP BY date(date_time)`
		}

		function queryArticleInfo(legacyID, datetime){
			return `SELECT article_title, article_url, article_image, positive_votes, negative_votes FROM article_votes
					WHERE date(date_time) = date("${datetime}") AND
					legacy_id = "${legacyID}"
					ORDER BY positive_votes DESC;`
		}
		var jsonObj = {'objectTitle:': objectTitle, 'objectCoverArt:': coverArt, 'dataPoints' : []};

		init.connection.query(query(), function(err, rows, fields) {
			if (err) throw res.json({"error": err})
			jsonObj.objectOverallGood = rows[0].agg_positive_votes;
			jsonObj.objectOverallBad = rows[0].agg_positive_votes;
		});

		var sentTotal = 0;
		var dayVal = "";
		var datetimeVal;
		init.connection.query(queryDataPoints(legacyID), function(err, rows, fields) {
			if (err) throw res.json({"error": err})
			
			for(var i = 0; i < rows.length; i++)
			{
				var dataPoint = {'articles': []};
				sentTotal = getSentimentPercent(rows[i].posVotes, rows[i].negVotes);
				dayVal = weekday[rows[i].date_time.getDay()];
				datetimeVal = new Date((rows[i].date_time + "").replace(/-/g,"/"));
				datetimeVal = datetimeVal.toISOString();
				dataPoint.day = dayVal;
				dataPoint.overall = sentTotal;
				init.connection.query(queryArticleInfo(legacyID, datetimeVal), function(err, rows, fields) {
					if (err) throw res.json({"error": err})
					for(var i = 0; i < rows.length; i++)
					{
						var articleObj = {};
						articleObj.name = rows[i].article_title;
						articleObj.image = rows[i].article_image;
						articleObj.sentiment = getSentimentPercent(rows[i].positive_votes, rows[i].negative_votes);
						articleObj.totalVotes = rows[i].positive_votes + rows[i].negative_votes;
						dataPoint.articles.push(articleObj);
					}
				});
				jsonObj.dataPoints.push(dataPoint);
			}
			console.log("Your whole object");
            console.log(jsonObj);
			res.json(jsonObj);
		});
	}

}

module.exports.ArticleModel = ArticleModel;