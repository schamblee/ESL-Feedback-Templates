'use strict';

const bodyParser = require('body-parser');
const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const { PORT, DATABASE_URL } = require('./config');
mongoose.Promise = global.Promise;

const { Users } = require('./models-users');
const { Lessons } = require('./models-lessons');
const { Students } = require('./models-students');
const { FeedbackTemplates } = require('./models-feedbackTemplates');
const { Feedback } = require('./models-feedback');

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

app.get('/api/users', (req, res) => {
  console.log("fetching users");
  Users
    .find()
    .then(users => {
      console.log(users);
      res.json({
        users: users.map(
          (users) => users.serialize())
      });
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    });
});

app.get('/api/users/:id', (req, res) => {
  Users
    .findById(req.params.id)
    .then(users => res.json(users.serialize()))
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    });
});


app.post('/api/users', (req, res) => {

  const requiredFields = ['email', 'password'];
  for (let i = 0; i < requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`;
      console.error(message);
      return res.status(400).send(message);
    }
  }

  Users
    .create({
      email: req.body.email,
      password: req.body.password
    })
    .then(users => res.status(201).json(users.serialize()))
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    });
});


app.put('/api/users/:id', (req, res) => {
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
  const updateableFields = ['email', 'password', 'closing'];

  updateableFields.forEach(field => {
    if (field in req.body) {
      toUpdate[field] = req.body[field];
    }
  });

  Users
    // all key/value pairs in toUpdate will be updated -- that's what `$set` does
    .findByIdAndUpdate(req.params.id, { $set: toUpdate })
    .then(users => res.status(204).end())
    .catch(err => res.status(500).json({ message: 'Internal server error' }));
});

app.delete('/api/users/:id', (req, res) => {
  Users
    .findByIdAndRemove(req.params.id)
    .then(users => res.status(204).end())
    .catch(err => res.status(500).json({ message: 'Internal server error' }));
});

//RETRIEVE ALL FEEDBACK TEMPLATES

app.get('/api/feedbackTemplates', (req, res) => {
	console.log("fetching feedback templates");
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


//Lessons

app.get('/api/lessons', (req, res) => {
  console.log("fetching lessons");
  Lessons
    .find()
    .then(lessons => {
      console.log(lessons);
      res.json({
        lessons: lessons.map(
          (lessons) => lessons.serialize())
      });
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    });
});


app.get('/api/lessons/:id', (req, res) => {
  Lessons
    .findById(req.params.id)
    .then(lessons => res.json(lessons.serialize()))
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    });
});


app.post('/api/lessons', (req, res) => {

  const requiredFields = ['referenceId', 'code', 'name', 'templateId'];
  for (let i = 0; i < requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`;
      console.error(message);
      return res.status(400).send(message);
    }
  }

  Lessons
    .create({
      referenceId: req.body.referenceId,
      code: req.body.code,
      name: req.body.name,
      templateId: req.body.templateId
    })
    .then(lessons => res.status(201).json(lessons.serialize()))
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    });
});


app.put('/api/lessons/:id', (req, res) => {
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
  const updateableFields = ['code', 'name', 'referenceId', 'templateId'];

  updateableFields.forEach(field => {
    if (field in req.body) {
      toUpdate[field] = req.body[field];
    }
  });

  Lessons
    // all key/value pairs in toUpdate will be updated -- that's what `$set` does
    .findByIdAndUpdate(req.params.id, { $set: toUpdate })
    .then(lessons => res.status(204).end())
    .catch(err => res.status(500).json({ message: 'Internal server error' }));
});

app.delete('/api/lessons/:id', (req, res) => {
  Lessons
    .findByIdAndRemove(req.params.id)
    .then(lessons => res.status(204).end())
    .catch(err => res.status(500).json({ message: 'Internal server error' }));
});


//Students

app.get('/api/students', (req, res) => {
  console.log("fetching students");
  Students
    .find()
    .then(students => {
      console.log(students);
      res.json({
        students: students.map(
          (students) => students.serialize())
      });
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    });
});


app.get('/api/students/:id', (req, res) => {
  Students
    .findById(req.params.id)
    .then(students => res.json(students.serialize()))
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    });
});


app.post('/api/students', (req, res) => {

  const requiredFields = ['userId', 'name'];
  for (let i = 0; i < requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`;
      console.error(message);
      return res.status(400).send(message);
    }
  }

  Students
    .create({
      userId: req.body.userId,
      name: req.body.name
    })
    .then(students => res.status(201).json(students.serialize()))
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    });
});


app.put('/api/students/:id', (req, res) => {
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
  const updateableFields = ['name', 'referenceId'];

  updateableFields.forEach(field => {
    if (field in req.body) {
      toUpdate[field] = req.body[field];
    }
  });

  Students
    // all key/value pairs in toUpdate will be updated -- that's what `$set` does
    .findByIdAndUpdate(req.params.id, { $set: toUpdate })
    .then(students => res.status(204).end())
    .catch(err => res.status(500).json({ message: 'Internal server error' }));
});

app.delete('/api/students/:id', (req, res) => {
  Students
    .findByIdAndRemove(req.params.id)
    .then(students => res.status(204).end())
    .catch(err => res.status(500).json({ message: 'Internal server error' }));
});

//Feedback

app.get('/api/feedback', (req, res) => {
  console.log("fetching feedback");
  Feedback
    .find()
    .then(feedback => {
      console.log(feedback);
      res.json({
        feedback: feedback.map(
          (feedback) => feedback.serialize())
      });
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    });
});


app.get('/api/feedback/:id', (req, res) => {
  Feedback
    .findById(req.params.id)
    .then(feedback => res.json(feedback.serialize()))
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    });
});


app.post('/api/feedback', (req, res) => {

  const requiredFields = ['lessonId', 'userId', 'studentId', 'text'];
  for (let i = 0; i < requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`;
      console.error(message);
      return res.status(400).send(message);
    }
  }

  Feedback
    .create({
      lessonId: req.body.lessonId,
      userId: req.body.userId,
      studentId: req.body.studentId,
      text: req.body.text
    })
    .then(feedback => res.status(201).json(feedback.serialize()))
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    });
});


app.put('/api/feedback/:id', (req, res) => {
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

  Feedback
    // all key/value pairs in toUpdate will be updated -- that's what `$set` does
    .findByIdAndUpdate(req.params.id, { $set: toUpdate })
    .then(students => res.status(204).end())
    .catch(err => res.status(500).json({ message: 'Internal server error' }));
});

app.delete('/api/feedback/:id', (req, res) => {
  Feedback
    .findByIdAndRemove(req.params.id)
    .then(students => res.status(204).end())
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