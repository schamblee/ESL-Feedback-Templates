'use strict';

const express = require('express');


const app = express();

app.use(express.static('public'));

if (require.main === module) {
  app.listen(process.env.PORT || 8080, function () {
    console.info(`App listening on ${this.address().port}`);
  });
}

app.get('/index', function(req, res) { 
	res.sendfile('./public/index.html'); 
});

app.get('/createAccount', function(req, res) { 
	res.sendfile('./public/createAccount.html'); 
});

app.get('/feedback', function(req, res) { 
	res.sendfile('./public/feedback.html'); 
});

module.exports = app;