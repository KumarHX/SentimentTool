var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var PORT = process.env.PORT || 3000

var articles = require('./routes/articles');

app.use('/api/articles', articles);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.listen(PORT, function () {
  console.log('Example app listening on port 3000!');
});

module.exports = app;