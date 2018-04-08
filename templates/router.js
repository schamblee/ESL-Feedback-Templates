'use strict';
const express = require('express');
const bodyParser = require('body-parser');

const { Templates } = require('./models');

const passport = require('passport');
const jwt = require('jsonwebtoken');

const config = require('../config');
const router = express.Router();
const { localAuth, createAuthToken } = require('../authConfig')


router.use(bodyParser.json());


router.get('/', (req, res) => {
  console.log("fetching feedback templates");
  Templates
    .find()
    .then(templates => {
      console.log(templates);
      res.json({
        templates: templates.map(
          (templates) => templates.serialize())
      });
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    });
});

router.get('/:id', (req, res) => {
  console.log(req.params.id)
  Templates
    .findById(req.params.id)
    .then(template => {
      res.json({
        template: template.serialize()
      });
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    });
});

router.get('/ref/:referenceId', (req, res) => {
  Templates
    .find({referenceId: req.params.referenceId})
    .then(template => {
      res.json({
        template: template.map(
          (template) => template.serialize())
      });
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    });
});


router.post('/', (req, res) => {

  const requiredFields = ['code'];
  for (let i = 0; i < requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`;
      console.error(message);
      return res.status(400).send(message);
    }
  }

  Templates
    .create({
      code: req.body.code,
      name: req.body.name,
      text: req.body.text,
      referenceId: req.body.referenceId
    })
    .then(templates => res.status(201).json(templates.serialize()))
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
  const updateableFields = ['text', "name", "referenceId"];

  updateableFields.forEach(field => {
    if (field in req.body) {
      toUpdate[field] = req.body[field];
    }
  });

  Templates
    // all key/value pairs in toUpdate will be updated -- that's what `$set` does
    .findByIdAndUpdate(req.params.id, { $set: toUpdate })
    .then(templates => res.status(204).end())
    .catch(err => res.status(500).json({ message: 'Internal server error' }));
});

router.delete('/:id', (req, res) => {
  Templates
    .findByIdAndRemove(req.params.id)
    .then(templates => res.status(204).end())
    .catch(err => res.status(500).json({ message: 'Internal server error' }));
});

module.exports = { router };