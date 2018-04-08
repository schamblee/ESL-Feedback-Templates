'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const should = chai.should();
const expect = chai.expect

const { Students } = require('../students');
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

function seedStudentData() {
  console.info('seeding student data');
  const seedData = [];
  for (let i = 1; i <= 10; i++) {
    seedData.push({
      referenceId: faker.name.firstName(),
      userId: faker.name.firstName(),
      name: faker.lorem.words(),
      nickName: faker.name.firstName(),
      notes: faker.lorem.words(),
      pronoun: faker.name.firstName()
    });

  return Students.insertMany(seedData);
  }
}


describe('Students API resource', function () {

  before(function () {
    return runServer(TEST_DATABASE_URL, 5678);
  });

  beforeEach(function () {
    return seedStudentData();
  });

  afterEach(function () {
    // tear down database so we ensure no state from this test
    return tearDownDb()
  });

  after(function () {
    return closeServer();
  });

describe('PUT endpoint', function () {

    // strategy:
    //  1. Get an existing student from db
    //  2. Make a PUT request to update that student
    //  4. Prove student in db is correctly updated
    it('should update fields you send over', function () {
      const updateData = {
        referenceId: 'hello',
        userId: 'cats cats cats',
        name: 'dogs dogs dogs',
        nickName: 'level 2 Jim',
        notes: 'pigs pigs pigs',
        pronoun: 'boy'
      };

      return Students
        .findOne()
        .then(students => {
          updateData.id = students.id;

          return chai.request(app)
            .put(`/api/students/${students.id}`)
            .send(updateData);
        })
        .then(res => {
          res.should.have.status(204);
          return Students.findById(updateData.id);
        })
        .then(students => {
          students.referenceId.should.equal(updateData.referenceId);
          students.name.should.equal(updateData.name);
        });
    });
  });

  describe('DELETE endpoint', function () {
    // strategy:
    //  1. get a student
    //  2. make a DELETE request for that student's id
    //  3. assert that response has right status code
    //  4. prove that student with the id doesn't exist in db anymore
    it('should delete a student by id', function () { 
      let students;

      return Students
        .findOne()
        .then(_students => {
          students = _students;
          return chai.request(app).delete(`/api/students/${students.id}`);
        })
        .then(res => {
          res.should.have.status(204);
          return Students.findById(students.id);
        })
        .then(_students => {
          // when a variable's value is null, chaining `should`
          // doesn't work. so `_student.should.be.null` would raise
          // an error. `should.be.null(_)` is how we can
          // make assertions about a null value.
          should.not.exist(_students);
        });
    });
  });
});

