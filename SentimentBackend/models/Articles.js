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

	graphInfo: function(res, legacyID){
        var jsonObj = {'dataPoints' : [], 'dateCollection': []};
        function respondData(){
            console.log("Responding with data");
            res.json(jsonObj);
        }
        
		function objectQuery(){
			return `SELECT object_name, object_image, SUM(positive_votes) as agg_positive_votes, SUM(negative_votes) as agg_negative_votes
            FROM object_votes
            INNER JOIN article_votes
            ON object_votes.legacy_id = article_votes.legacy_id
            WHERE article_votes.legacy_id = "${legacyID}"
            GROUP BY article_votes.legacy_id;`
		}

		function getSentimentPercent(posVotes, negVotes){
 			return Math.floor(posVotes / (posVotes+negVotes)*100);
 		}

		function queryDataPoints(legacyID){
			return `SELECT SUM(positive_votes) as posVotes, SUM(negative_votes) as negVotes, date_time, dayname(date_time) as day
					FROM article_votes
					WHERE date_time >= DATE_ADD(CURDATE(), INTERVAL -14 DAY) AND
					legacy_id = "${legacyID}"
					GROUP BY date(date_time)`
		}

		function queryArticleInfo(legacyID, datetime){
			return `SELECT article_title, article_url, article_image, positive_votes, negative_votes FROM article_votes
					WHERE date(date_time) = date("${datetime}") AND
					legacy_id = "${legacyID}"
					ORDER BY positive_votes DESC;`
		}
        
		init.connection.query(objectQuery(), function(err, rows, fields) {
			if (err) throw res.json({"error": err})
            jsonObj.objectOverallGood = rows[0].agg_positive_votes;
            jsonObj.objectOverallBad = rows[0].agg_negative_votes;
            jsonObj.objectCoverArt = rows[0].object_image;
            jsonObj.objectTitle = rows[0].object_name;
            buildDataPointObjects(function(){
                // This is horrible and needs to be fixed
                setTimeout(function(){
                    respondData();
                }, 2000);
                // Response will not wait for all data otherwise
                
            });
		});
        
        function buildDataPointObjects(callback){
            init.connection.query(queryDataPoints(legacyID), function(err, dataPointRows, fields) {
                if (err) throw res.json({"error": err})
                for(var i = 0; i < dataPointRows.length; i++) {
                    var dataPoint = {'articles': []},
                        datetimeVal = new Date((dataPointRows[i].date_time + "").replace(/-/g,"/")),
                        datetimeVal = datetimeVal.toISOString();
                    jsonObj.dateCollection.push(datetimeVal);
                    dataPoint.day = dataPointRows[i].day;
                    dataPoint.overall = getSentimentPercent(dataPointRows[i].posVotes, dataPointRows[i].negVotes);
                    jsonObj.dataPoints.push(dataPoint);
                }
                jsonObj.dateCollection.forEach(buildArticles);
            });
            callback();
        }
        
        function buildArticles(item, index, arr){
            init.connection.query(queryArticleInfo(legacyID, item), function(err, articleRows, fields) {
                if (err) throw res.json({"error": err})
                for(var j = 0; j < articleRows.length; j++){
                    var articleObj = {};
                    articleObj.name = articleRows[j].article_title;
                    articleObj.image = articleRows[j].article_image;
                    articleObj.sentiment = getSentimentPercent(articleRows[j].positive_votes, articleRows[j].negative_votes),
                    articleObj.url = articleRows[j].article_url;
                    articleObj.totalVotes = articleRows[j].positive_votes + articleRows[j].negative_votes;
                    jsonObj.dataPoints[index].articles.push(articleObj);
                }
            }); 
        }
    }

}

module.exports.ArticleModel = ArticleModel;