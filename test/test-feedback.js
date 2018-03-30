'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const should = chai.should();
const expect = chai.expect

const { Feedback } = require('../models-feedback');
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

function seedFeedbackData() {
  console.info('seeding feedback data');
  const seedData = [];
  for (let i = 1; i <= 10; i++) {
    seedData.push({
      lessonId: faker.name.firstName(),
      userId: faker.name.firstName(),
      studentId: faker.name.firstName(),
      text: faker.lorem.words(),
      created: faker.date.past()
    });

  return Feedback.insertMany(seedData);
  }
}


describe('Feedback API resource', function () {

  before(function () {
    return runServer(TEST_DATABASE_URL, 5678);
  });

  beforeEach(function () {
    return seedFeedbackData();
  });

  afterEach(function () {
    // tear down database so we ensure no state from this test
    return tearDownDb()
  });

  after(function () {
    return closeServer();
  });

  describe('GET endpoint', function () {

    it('should return all existing feedback', function () {
      // strategy:
      //    1. get back all feedback returned by by GET request to `/api/feedback`
      //    2. prove res has right status, data type
      //    3. prove the number of feedback we got back is equal to number
      //       in db.
      let res;
      return chai.request(app)
        .get('/api/feedback')
        .then(_res => {
          res = _res;
          res.should.have.status(200);
          // otherwise our db seeding didn't work
          res.body.feedback.should.have.length.of.at.least(1);

          return Feedback.count();
        })
        .then(count => {
          // the number of returned feedback should be same
          // as number of feedback in DB
          expect(res.body.feedback).to.have.lengthOf(count);
        })
    });
  });

  describe('POST endpoint', function () {
    // strategy: make a POST request with data,
    // then prove that the feedback we get back has
    // right keys, and that `id` is there (which means
    // the data was inserted into db)
    it('should add a new feedback', function () {

      const newFeedback = {
        lessonId: faker.name.firstName(),
        userId: faker.name.firstName(),
        studentId: faker.name.firstName(),
        text: faker.lorem.words()
      };

      return chai.request(app)
        .post('/api/feedback')
        .send(newFeedback)
        .then(function (res) {
          res.should.have.status(201);
          res.should.be.json;
          res.body.should.be.a('object');
          res.body.should.include.keys("id", "lessonId", "text");
          // cause Mongo should have created id on insertion
          res.body.id.should.not.be.null;
          res.body.studentId.should.equal(newFeedback.studentId);
          res.body.userId.should.equal(newFeedback.userId);
          res.body.lessonId.should.equal(newFeedback.lessonId);
          res.body.text.should.equal(newFeedback.text);
          return Feedback.findById(res.body.id);
        })
        .then(function (feedback) {
          feedback.lessonId.should.equal(newFeedback.lessonId);
          feedback.text.should.equal(newFeedback.text);
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

      return Feedback
        .findOne()
        .then(feedback => {
          updateData.id = feedback.id;

          return chai.request(app)
            .put(`/api/feedback/${feedback.id}`)
            .send(updateData);
        })
        .then(res => {
          res.should.have.status(204);
          return Feedback.findById(updateData.id);
        })
        .then(feeback => {
          feeback.text.should.equal(updateData.text);
        });
    });
  });

  describe('DELETE endpoint', function () {
    // strategy:
    //  1. get a feedback
    //  2. make a DELETE request for that feedback's id
    //  3. assert that response has right status code
    //  4. prove that feedback with the id doesn't exist in db anymore
    it('should delete a feeback by id', function () {

      let feedback;

      return Feedback
        .findOne()
        .then(_feedback => {
          feedback = _feedback;
          return chai.request(app).delete(`/api/feedback/${feedback.id}`);
        })
        .then(res => {
          res.should.have.status(204);
          return Feedback.findById(feedback.id);
        })
        .then(_feedback => {
          // when a variable's value is null, chaining `should`
          // doesn't work. so `_feedback.should.be.null` would raise
          // an error. `should.be.null(_)` is how we can
          // make assertions about a null value.
          should.not.exist(_feedback);
        });
    });
  });
});



