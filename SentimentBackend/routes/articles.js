var express = require('express');
var bodyParser = require('body-parser');
var router = express.Router();
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));

var article_query = require("../models/Articles");
var article = article_query.ArticleModel;

router.put('/vote/:articleID', function(req, res, next){
	var articleIDe = req.params.articleID;
	var feeling = req.body.sentiment;
	var legacy_id = req.body.legacyID;
	var publish_date = req.body.publishDate;
	var	objectType = req.body.objectType;
	var	objectName = req.body.objectName;
	var	objectImage = req.body.objectImage;
	var	articleURL = req.body.articleURL;
	var	articleTitle = req.body.articleTitle;
	var	articleImage = req.body.articleImage;
    article.voteHandler(res, articleIDe, feeling, publish_date, legacy_id, objectType, objectName, objectImage, articleURL, articleTitle, articleImage);
});

router.get('/getVoteResults/:articleID', function(req, res, next){
	var articleIDe = req.params.articleID;
    article.voteResults(res, articleIDe);
});

router.get('/getTopSentiment/:feeling/:count', function(req, res, next){
	var count = req.params.count;
	var feeling = req.params.feeling;
    article.topSentiment(res, count, feeling);
});

router.get('/graphData/:legacyID', function(req, res, next){
	var legacyID = req.params.legacyID;
    article.graphInfo(res, legacyID);
});


module.exports = router;