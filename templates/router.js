'use strict';
const express = require('express');
const bodyParser = require('body-parser');

const { FeedbackTemplates } = require('./models');

const passport = require('passport');
const jwt = require('jsonwebtoken');

const config = require('../config');
const router = express.Router();
const { localAuth, createAuthToken } = require('../authConfig')


router.use(bodyParser.json());


router.get('/', (req, res) => {
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

router.get('/:id', (req, res) => {
  FeedbackTemplates
    .findById(req.params.id)
    .then(feedbackTemplates => res.json(feedbackTemplates.serialize()))
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    });
});


router.post('/', (req, res) => {

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


router.put('/:id', (req, res) => {
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

router.delete('/:id', (req, res) => {
  FeedbackTemplates
    .findByIdAndRemove(req.params.id)
    .then(feedbackTemplates => res.status(204).end())
    .catch(err => res.status(500).json({ message: 'Internal server error' }));
});

module.exports = { router };