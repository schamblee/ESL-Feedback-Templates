'use strict';
const express = require('express');
const bodyParser = require('body-parser');

const { Lessons } = require('./models');

const passport = require('passport');
const jwt = require('jsonwebtoken');

const config = require('../config');
const router = express.Router();
const { localAuth, createAuthToken } = require('../authConfig')


router.use(bodyParser.json());


router.get('/api/lessons', (req, res) => {
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


router.get('/api/lessons/:id', (req, res) => {
  Lessons
    .findById(req.params.id)
    .then(lessons => res.json(lessons.serialize()))
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    });
});


router.post('/api/lessons', (req, res) => {

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


router.put('/api/lessons/:id', (req, res) => {
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

router.delete('/api/lessons/:id', (req, res) => {
  Lessons
    .findByIdAndRemove(req.params.id)
    .then(lessons => res.status(204).end())
    .catch(err => res.status(500).json({ message: 'Internal server error' }));
});

module.exports = { router };