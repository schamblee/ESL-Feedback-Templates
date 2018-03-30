'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const should = chai.should();
const expect = chai.expect

const { Users } = require('../models-users');
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

function seedUserData() {
  console.info('seeding users data');
  const seedData = [];
  for (let i = 1; i <= 10; i++) {
    seedData.push({
      email: faker.internet.email(),
      password: faker.lorem.words(),
      closing: faker.lorem.words(),
      created: faker.date.past()
    });

  return Users.insertMany(seedData);
  }
}


describe('Users API resource', function () {

  before(function () {
    return runServer(TEST_DATABASE_URL, 1234);
  });

  beforeEach(function () {
    return seedUserData();
  });

  afterEach(function () {
    // tear down database so we ensure no state from this test
    return tearDownDb()
  });

  after(function () {
    return closeServer();
  });

  describe('GET endpoint', function () {

    it('should return all existing users', function () {
      // strategy:
      //    1. get back all users returned by by GET request to `/api/users`
      //    2. prove res has right status, data type
      //    3. prove the number of users we got back is equal to number
      //       in db.
      let res;
      return chai.request(app)
        .get('/api/users')
        .then(_res => {
          res = _res;
          res.should.have.status(200);
          // otherwise our db seeding didn't work
          res.body.users.should.have.length.of.at.least(1);

          return Users.count();
        })
        .then(count => {
          // the number of returned users should be same
          // as number of users in DB
          expect(res.body.users).to.have.lengthOf(count);
        })
    });
  });

  describe('POST endpoint', function () {
    // strategy: make a POST request with data,
    // then prove that the user we get back has
    // right keys, and that `id` is there (which means
    // the data was inserted into db)
    it('should add a new users', function () {

      const newUsers = {
        email: faker.lorem.text(),
        password: faker.lorem.text(),
        closing: faker.lorem.text()
      };

      return chai.request(app)
        .post('/api/users')
        .send(newUsers)
        .then(function (res) {
          res.should.have.status(201);
          res.should.be.json;
          res.body.should.be.a('object');
          res.body.should.include.keys("created", "email", "id", "password");
          res.body.email.should.equal(newUsers.email);
          // cause Mongo should have created id on insertion
          res.body.id.should.not.be.null;
          res.body.password.should.equal(newUsers.password);
          return Users.findById(res.body.id);
        })
        .then(function (users) {
          users.email.should.equal(newUsers.email);
          users.password.should.equal(newUsers.password);
        });
    });
  });

describe('PUT endpoint', function () {

    // strategy:
    //  1. Get an existing user from db
    //  2. Make a PUT request to update that user
    //  4. Prove puserin db is correctly updated
    it('should update fields you send over', function () {
      const updateData = {
        email: 'cats cats cats',
        password: 'dogs dogs dogs',
        closing: 'hello'
      };

      return Users
        .findOne()
        .then(users => {
          updateData.id = users.id;

          return chai.request(app)
            .put(`/api/users/${users.id}`)
            .send(updateData);
        })
        .then(res => {
          res.should.have.status(204);
          return Users.findById(updateData.id);
        })
        .then(users => {
          users.email.should.equal(updateData.email);
          users.password.should.equal(updateData.password);
          users.closing.should.equal(updateData.closing);
        });
    });
  });

  describe('DELETE endpoint', function () {
    // strategy:
    //  1. get a user
    //  2. make a DELETE request for that user's id
    //  3. assert that response has right status code
    //  4. prove that user with the id doesn't exist in db anymore
    it('should delete a user by id', function () {

      let users;

      return Users
        .findOne()
        .then(_users => {
          users = _users;
          return chai.request(app).delete(`/api/users/${users.id}`);
        })
        .then(res => {
          res.should.have.status(204);
          return Users.findById(users.id);
        })
        .then(_users => {
          // when a variable's value is null, chaining `should`
          // doesn't work. so `_user.should.be.null` would raise
          // an error. `should.be.null(_user)` is how we can
          // make assertions about a null value.
          should.not.exist(_users);
        });
    });
  });
});



