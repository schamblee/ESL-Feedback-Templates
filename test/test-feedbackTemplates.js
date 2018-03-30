'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const should = chai.should();
const expect = chai.expect

const { FeedbackTemplates } = require('../models-feedbackTemplates');
const { closeServer, runServer, app } = require('../server');
const { TEST_DATABASE_URL } = require('../config');

chai.use(chaiHttp);

// Deletes the entire database.
function tearDownDb() {
  return new Promise((resolve, reject) => {
    console.warn('Deleting database');
    mongoose.connection.dropDatabase()
      .then(result => resolve(result))
      .catch(err => reject(err));
  });
}

function seedFeedbackTemplatesData() {
  console.info('seeding feedbackTemplates data');
  const seedData = [];
  for (let i = 1; i <= 10; i++) {
    seedData.push({
      lessonId: faker.name.firstName(),
      text: faker.lorem.words()
    });

  return FeedbackTemplates.insertMany(seedData);
  }
}


describe('FeedbackTemplate API resource', function () {

  before(function () {
    return runServer(TEST_DATABASE_URL, 5678);
  });

  beforeEach(function () {
    return seedFeedbackTemplatesData();
  });

  afterEach(function () {
    // tear down database so we ensure no state from this test
    return tearDownDb()
  });

  after(function () {
    return closeServer();
  });

  describe('GET endpoint', function () {

    it('should return all existing feedbackTemplates', function () {
      // strategy:
      //    1. get back all feedbackTemplates returned by by GET request to `/api/feedbackTemplates`
      //    2. prove res has right status, data type
      //    3. prove the number of feedbackTemplates we got back is equal to number
      //       in db.
      let res;
      return chai.request(app)
        .get('/api/feedbackTemplates')
        .then(_res => {
          res = _res;
          res.should.have.status(200);
          // otherwise our db seeding didn't work
          res.body.feedbackTemplates.should.have.length.of.at.least(1);

          return FeedbackTemplates.count();
        })
        .then(count => {
          // the number of returned feedbackTemplates should be same
          // as number of feedbackTemplates in DB
          expect(res.body.feedbackTemplates).to.have.lengthOf(count);
        })
    });
  });

  describe('POST endpoint', function () {
    // strategy: make a POST request with data,
    // then prove that the feedback template we get back has
    // right keys, and that `id` is there (which means
    // the data was inserted into db)
    it('should add a new feedback template', function () {

      const newFeedbackTemplate = {
        lessonId: faker.name.firstName(),
        text: faker.lorem.words()
      };

      return chai.request(app)
        .post('/api/feedbackTemplates')
        .send(newFeedbackTemplate)
        .then(function (res) {
          res.should.have.status(201);
          res.should.be.json;
          res.body.should.be.a('object');
          res.body.should.include.keys("id", "lessonId", "text");
          // cause Mongo should have created id on insertion
          res.body.id.should.not.be.null;
          res.body.lessonId.should.equal(newFeedbackTemplate.lessonId);
          res.body.text.should.equal(newFeedbackTemplate.text);
          return FeedbackTemplates.findById(res.body.id);
        })
        .then(function (feedbackTemplates) {
          feedbackTemplates.lessonId.should.equal(newFeedbackTemplate.lessonId);
          feedbackTemplates.text.should.equal(newFeedbackTemplate.text);
        });
    });
  });

describe('PUT endpoint', function () {

    // strategy:
    //  1. Get an existing lesson from db
    //  2. Make a PUT request to update that lesson
    //  4. Prove lesson in db is correctly updated
    it('should update fields you send over', function () {
      const updateData = {
        text: 'cats cats cats'
      };

      return FeedbackTemplates
        .findOne()
        .then(feedbackTemplates => {
          updateData.id = feedbackTemplates.id;

          return chai.request(app)
            .put(`/api/feedbackTemplates/${feedbackTemplates.id}`)
            .send(updateData);
        })
        .then(res => {
          res.should.have.status(204);
          return FeedbackTemplates.findById(updateData.id);
        })
        .then(feebackTemplates => {
          feebackTemplates.text.should.equal(updateData.text);
        });
    });
  });

  describe('DELETE endpoint', function () {
    // strategy:
    //  1. get a lesson
    //  2. make a DELETE request for that lesson's id
    //  3. assert that response has right status code
    //  4. prove that lesson with the id doesn't exist in db anymore
    it('should delete a feebackTemplate by id', function () {

      let feedbackTemplates;

      return FeedbackTemplates
        .findOne()
        .then(_feedbackTemplates => {
          feedbackTemplates = _feedbackTemplates;
          return chai.request(app).delete(`/api/feedbackTemplates/${feedbackTemplates.id}`);
        })
        .then(res => {
          res.should.have.status(204);
          return FeedbackTemplates.findById(feedbackTemplates.id);
        })
        .then(_feedbackTemplates => {
          // when a variable's value is null, chaining `should`
          // doesn't work. so `_feedbacktemplate.should.be.null` would raise
          // an error. `should.be.null(_)` is how we can
          // make assertions about a null value.
          should.not.exist(_feedbackTemplates);
        });
    });
  });
});



