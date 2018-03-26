'use strict';

const bodyParser = require('body-parser');
const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const { PORT, DATABASE_URL } = require('./config');
mongoose.Promise = global.Promise;

//const { Users } = require('./models');
//const { Lessons } = require('./models');
//const { Students } = require('./models');
const { FeedbackTemplates } = require('./models');
//const { Feedback } = require('./models');

const app = express();

app.use(express.static('public'));
app.use(morgan('common'));
app.use(bodyParser.json());

app.get('/index', function(req, res) { 
	res.sendfile('./public/index.html'); 
});

app.get('/login', function(req, res) { 
	res.sendfile('./public/login.html'); 
});

app.get('/feedback', function(req, res) { 
	res.sendfile('./public/feedback.html'); 
});


//RETRIEVE ALL FEEDBACK TEMPLATES

app.get('/api/feedbackTemplates', (req, res) => {
	console.log("fetching feedback templates");
	console.log
  FeedbackTemplates
    .find()
    .then(feedbackTemplates => {
      console.log(feedbackTemplates);
      res.json({
        feedbackTemplates: feedbackTemplates.map(
          (feedbackTemplates) => feedbackTemplates.serialize())
      });
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    });
});

app.get('/api/feedbackTemplates/:id', (req, res) => {
  FeedbackTemplates
    .findById(req.params.id)
    .then(feedbackTemplates => res.json(feedbackTemplates.serialize()))
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    });
});


app.post('/api/feedbackTemplates', (req, res) => {

  const requiredFields = ['text'];
  for (let i = 0; i < requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`;
      console.error(message);
      return res.status(400).send(message);
    }
  }

  FeedbackTemplates
    .create({
      lessonId: req.body.lessonId,
      text: req.body.text
    })
    .then(feedbackTemplates => res.status(201).json(feedbackTemplates.serialize()))
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    });
});


app.put('/api/feedbackTemplates/:id', (req, res) => {
  // ensure that the id in the request path and the one in request body match
  if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
    const message = (
      `Request path id (${req.params.id}) and request body id ` +
      `(${req.body.id}) must match`);
    console.error(message);
    return res.status(400).json({ message: message });
  }

  // we only support a subset of fields being updateable.
  // if the user sent over any of the updatableFields, we udpate those values
  // in document
  const toUpdate = {};
  const updateableFields = ['text'];

  updateableFields.forEach(field => {
    if (field in req.body) {
      toUpdate[field] = req.body[field];
    }
  });

  FeedbackTemplates
    // all key/value pairs in toUpdate will be updated -- that's what `$set` does
    .findByIdAndUpdate(req.params.id, { $set: toUpdate })
    .then(feedbackTemplates => res.status(204).end())
    .catch(err => res.status(500).json({ message: 'Internal server error' }));
});

app.delete('/api/feedbackTemplates/:id', (req, res) => {
  FeedbackTemplates
    .findByIdAndRemove(req.params.id)
    .then(feedbackTemplates => res.status(204).end())
    .catch(err => res.status(500).json({ message: 'Internal server error' }));
});

// catch-all endpoint if client makes request to non-existent endpoint
app.use('*', function (req, res) {
  res.status(404).json({ message: 'Not Found' });
});

// closeServer needs access to a server object, but that only
// gets created when `runServer` runs, so we declare `server` here
// and then assign a value to it in run
let server;

// this function connects to our database, then starts the server
function runServer(databaseUrl, port = PORT) {

  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, err => {
      if (err) {
        return reject(err);
      }
      server = app.listen(port, () => {
        console.log(`Your app is listening on port ${port}`);
        resolve();
      })
        .on('error', err => {
          mongoose.disconnect();
          reject(err);
        });
    });
  });
}

// this function closes the server, and returns a promise. we'll
// use it in our integration tests later.
function closeServer() {
  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      console.log('Closing server');
      server.close(err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  });
}



if (require.main === module) {
  runServer(DATABASE_URL).catch(err => console.error(err));
}

module.exports = app;