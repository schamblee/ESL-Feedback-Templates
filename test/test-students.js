'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const should = chai.should();
const expect = chai.expect

const { Students } = require('../models-students');
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
      gender: faker.name.firstName()
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

  describe('GET endpoint', function () {

    it('should return all existing students', function () {
      // strategy:
      //    1. get back all student returned by by GET request to `/api/students`
      //    2. prove res has right status, data type
      //    3. prove the number of students we got back is equal to number
      //       in db.
      let res;
      return chai.request(app)
        .get('/api/students')
        .then(_res => {
          res = _res;
          res.should.have.status(200);
          // otherwise our db seeding didn't work
          res.body.students.should.have.length.of.at.least(1);

          return Students.count();
        })
        .then(count => {
          // the number of returned students should be same
          // as number of students in DB
          expect(res.body.students).to.have.lengthOf(count);
        })
    });
  });

  describe('POST endpoint', function () {
    // strategy: make a POST request with data,
    // then prove that the student we get back has
    // right keys, and that `id` is there (which means
    // the data was inserted into db)
    it('should add a new student', function () {

      const newStudent = {
        referenceId: faker.name.firstName(),
        userId: faker.name.firstName(),
        name: faker.lorem.words()
      };

      return chai.request(app)
        .post('/api/students')
        .send(newStudent)
        .then(function (res) {
          res.should.have.status(201);
          res.should.be.json;
          res.body.should.be.a('object');
          res.body.should.include.keys("id", "name", "userId", "notes", "nickName");
          res.body.id.should.not.be.null;
          res.body.name.should.equal(newStudent.name);
          return Students.findById(res.body.id);
        })
        .then(function (students) {
          students.name.should.equal(newStudent.name);
          students.userId.should.equal(newStudent.userId);
        });
    });
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
        nickName: 'level 2 Jerry',
        notes: 'pigs pigs pigs',
        gender: 'boy'
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

