'use strict';

const bodyParser = require('body-parser');
const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const { Users } = require('./models');
const { Lessons } = require('./models');
const { Students } = require('./models');
const { FeedbackTemplates } = require('./models');
const { Feedback } = require('./models');

const app = express();

app.use(express.static('public'));
app.use(morgan('common'));
app.use(bodyParser.json());



if (require.main === module) {
  app.listen(process.env.PORT || 8080, function () {
    console.info(`App listening on ${this.address().port}`);
  });
}

app.get('/index', function(req, res) { 
	res.sendfile('./public/index.html'); 
});

app.get('/login', function(req, res) { 
	res.sendfile('./public/login.html'); 
});

app.get('/feedback', function(req, res) { 
	res.sendfile('./public/feedback.html'); 
});

module.exports = app;