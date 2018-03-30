'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const should = chai.should();
const expect = chai.expect

const { Lessons } = require('../models-lessons');
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

function seedLessonData() {
  console.info('seeding lessons data');
  const seedData = [];
  for (let i = 1; i <= 10; i++) {
    seedData.push({
      referenceId: faker.name.firstName(),
      code: faker.name.firstName(),
      name: faker.lorem.words(),
      templateId: faker.name.firstName()
    });

  return Lessons.insertMany(seedData);
  }
}


describe('Lessons API resource', function () {

  before(function () {
    return runServer(TEST_DATABASE_URL, 5678);
  });

  beforeEach(function () {
    return seedLessonData();
  });

  afterEach(function () {
    // tear down database so we ensure no state from this test
    return tearDownDb()
  });

  after(function () {
    return closeServer();
  });

  describe('GET endpoint', function () {

    it('should return all existing lessons', function () {
      // strategy:
      //    1. get back all lessons returned by by GET request to `/api/lessons`
      //    2. prove res has right status, data type
      //    3. prove the number of lessons we got back is equal to number
      //       in db.
      let res;
      return chai.request(app)
        .get('/api/lessons')
        .then(_res => {
          res = _res;
          res.should.have.status(200);
          // otherwise our db seeding didn't work
          res.body.lessons.should.have.length.of.at.least(1);

          return Lessons.count();
        })
        .then(count => {
          // the number of returned lessons should be same
          // as number of lessons in DB
          expect(res.body.lessons).to.have.lengthOf(count);
        })
    });
  });

  describe('POST endpoint', function () {
    // strategy: make a POST request with data,
    // then prove that the lesson we get back has
    // right keys, and that `id` is there (which means
    // the data was inserted into db)
    it('should add a new lesson', function () {

      const newLesson = {
        referenceId: faker.name.firstName(),
        code: faker.name.firstName(),
        name: faker.lorem.words(),
        templateId: faker.name.firstName()
      };

      return chai.request(app)
        .post('/api/lessons')
        .send(newLesson)
        .then(function (res) {
          res.should.have.status(201);
          res.should.be.json;
          res.body.should.be.a('object');
          res.body.should.include.keys("id", "code", "name", "referenceId", "templateId");
          res.body.code.should.equal(newLesson.code);
          // cause Mongo should have created id on insertion
          res.body.id.should.not.be.null;
          res.body.name.should.equal(newLesson.name);
          res.body.referenceId.should.equal(newLesson.referenceId);
          res.body.templateId.should.equal(newLesson.templateId);
          return Lessons.findById(res.body.id);
        })
        .then(function (lessons) {
          lessons.name.should.equal(newLesson.name);
          lessons.code.should.equal(newLesson.code);
          lessons.referenceId.should.equal(newLesson.referenceId);
          lessons.templateId.should.equal(newLesson.templateId);
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
        code: 'cats cats cats',
        name: 'dogs dogs dogs',
        referenceId: 'hello'
      };

      return Lessons
        .findOne()
        .then(lessons => {
          updateData.id = lessons.id;

          return chai.request(app)
            .put(`/api/lessons/${lessons.id}`)
            .send(updateData);
        })
        .then(res => {
          res.should.have.status(204);
          return Lessons.findById(updateData.id);
        })
        .then(lessons => {
          lessons.code.should.equal(updateData.code);
          lessons.name.should.equal(updateData.name);
          lessons.referenceId.should.equal(updateData.referenceId);
        });
    });
  });

  describe('DELETE endpoint', function () {
    // strategy:
    //  1. get a lesson
    //  2. make a DELETE request for that lesson's id
    //  3. assert that response has right status code
    //  4. prove that lesson with the id doesn't exist in db anymore
    it('should delete a lesson by id', function () {

      let lessons;

      return Lessons
        .findOne()
        .then(_lessons => {
          lessons = _lessons;
          return chai.request(app).delete(`/api/lessons/${lessons.id}`);
        })
        .then(res => {
          res.should.have.status(204);
          return Lessons.findById(lessons.id);
        })
        .then(_lessons => {
          // when a variable's value is null, chaining `should`
          // doesn't work. so `_lesson.should.be.null` would raise
          // an error. `should.be.null(_)` is how we can
          // make assertions about a null value.
          should.not.exist(_lessons);
        });
    });
  });
});



