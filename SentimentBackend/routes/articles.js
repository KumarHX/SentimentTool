/*jslint node:true */
var express = require("express");
var bodyParser = require("body-parser");
var router = express.Router();
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));

var article_query = require("../models/Articles");
var article = article_query.ArticleModel;

router.put('/vote/:articleID', function (req, res, next) {
    "use strict";
	var articleObject = {
		id: req.params.articleID,
		legacyId: req.body.legacyID,
		publishDate: req.body.publishDate,
		url: req.body.articleURL,
		title: req.body.articleTitle,
		image: req.body.articleImage
	},
    ignObject = {
		legacyId: req.body.legacyID,
		type: req.body.objectType,
		name: req.body.objectName,
		image: req.body.objectImage
	},
    vote = req.body.sentiment;
    
    console.log("Article Object:");
    console.log(articleObject);
    console.log("IGN Object");
    console.log(ignObject);
    
    article.voteHandler(res, articleObject, ignObject, vote);
});

router.get('/getVoteResults/:articleID', function(req, res, next) {
    "use strict";
	var articleId = req.params.articleID;
    article.voteResults(res, articleId);
});

router.get('/getTopSentiment/:feeling/:count', function (req, res, next) {
    "use strict";
	var count = req.params.count,
	feeling = req.params.feeling;
    article.topSentiment(res, count, feeling);
});

router.get('/graphData/:legacyID', function (req, res, next) {
    "use strict";
	var legacyID = req.params.legacyID;
	var objectTitle = req.params.objectTitle;
	var coverArt = req.params.coverArt;
    article.graphInfo(res, legacyID, objectTitle, coverArt);
});


module.exports = router;