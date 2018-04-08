'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const should = chai.should();
const expect = chai.expect

const { Templates } = require('../templates');
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

function seedTemplatesData() {
  console.info('seeding templates data');
  const seedData = [];
  for (let i = 1; i <= 10; i++) {
    seedData.push({
      lessonId: faker.name.firstName(),
      text: faker.lorem.words(),
      code: faker.name.firstName(),
      name: faker.name.firstName()
    });

  return Templates.insertMany(seedData);
  }
}


describe('Template API resource', function () {

  before(function () {
    return runServer(TEST_DATABASE_URL, 5678);
  });

  beforeEach(function () {
    return seedTemplatesData();
  });

  afterEach(function () {
    // tear down database so we ensure no state from this test
    return tearDownDb()
  });

  after(function () {
    return closeServer();
  });

  describe('GET endpoint', function () {

    it('should return all existing templates', function () {
      // strategy:
      //    1. get back all templates returned by by GET request to `/api/templates`
      //    2. prove res has right status, data type
      //    3. prove the number of templates we got back is equal to number
      //       in db.
      let res;
      return chai.request(app)
        .get('/api/templates')
        .then(_res => {
          res = _res;
          res.should.have.status(200);
          // otherwise our db seeding didn't work
          res.body.templates.should.have.length.of.at.least(1);

          return Templates.count();
        })
        .then(count => {
          // the number of returned templates should be same
          // as number of templates in DB
          expect(res.body.templates).to.have.lengthOf(count);
        })
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

      return Templates
        .findOne()
        .then(templates => {
          updateData.id = templates.id;

          return chai.request(app)
            .put(`/api/templates/${templates.id}`)
            .send(updateData);
        })
        .then(res => {
          res.should.have.status(204);
          return Templates.findById(updateData.id);
        })
        .then(templates => {
          templates.text.should.equal(updateData.text);
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

      let templates;

      return Templates
        .findOne()
        .then(_templates => {
          templates = _templates;
          return chai.request(app).delete(`/api/templates/${templates.id}`);
        })
        .then(res => {
          res.should.have.status(204);
          return Templates.findById(templates.id);
        })
        .then(_templates => {
          // when a variable's value is null, chaining `should`
          // doesn't work. so `_template.should.be.null` would raise
          // an error. `should.be.null(_)` is how we can
          // make assertions about a null value.
          should.not.exist(_templates);
        });
    });
  });
});





