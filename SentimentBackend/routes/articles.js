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
    article.voteHandler(res, articleIDe, feeling, publish_date, legacy_id);
});

router.get('/getVoteResults/:articleID', function(req, res, next){
	var articleIDe = req.params.articleID;
    article.voteResults(res, articleIDe);
});

module.exports = router;