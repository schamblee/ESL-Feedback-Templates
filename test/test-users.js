'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');

// this makes the expect syntax available throughout
// this module
const expect = chai.expect;

const {Users} = require('../models-users');
const {app} = require('../server');
const {TEST_DATABASE_URL} = require('../config');

chai.use(chaiHttp);

function runServer(databaseUrl, port = PORT) {

  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, err => {
      if (err) {
        return reject(err);
      }
      server = app.listen(port, () => {
        console.log(`Your app is listening on port ${port}`);
        resolve();
      })
        .on('error', err => {
          mongoose.disconnect();
          reject(err);
        });
    });
  });
}

// this function closes the server, and returns a promise. we'll
// use it in our integration tests later.
function closeServer() {
  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      console.log('Closing server');
      server.close(err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  });
}


function seedUserData() {
  console.info('seeding user data');
  const seedData = [];

  for (let i=1; i<=10; i++) {
    seedData.push(generateRestaurantData());
  }
  // this will return a promise
  return Users.insertMany(seedData);
}

// used to generate data to put in db
function generateEmail() {
  const emails = [
    'Manhattan@gmail.com', 'Queens@gmail.com', 'Brooklyn@gmail.com', 'Bronx@gmail.com', 'StatenIsland@gmail.com'];
  return emails[Math.floor(Math.random() * emails.length)];
}

// used to generate data to put in db
function generatePassword() {
  const passwords = ['C@tf1Sh', 'ThaiMah1000', 'Col_mole12#'];
  return passwords[Math.floor(Math.random() * passwords.length)];
}

// used to generate data to put in db
function generateClosing() {
  const closings = ['Thanks for a great class!', '[name] earned 5 stars!', 'Great job, [name]!', 'Sincerely, Teacher Rebecca', 'Awesome work :)!!!'];
  return closings[Math.floor(Math.random() * closings.length)];
  };


// generate an object represnting a user.
// can be used to generate seed data for db
// or request.body data
function generateUserData() {
  return {
    name: faker.name.name(),
    email: generateUsername(),
    password: generatePassword(),
    closing: generateClosing()
  };
}


// this function deletes the entire database.
// we'll call it in an `afterEach` block below
// to ensure data from one test does not stick
// around for next one
function tearDownDb() {
  console.warn('Deleting database');
  return mongoose.connection.dropDatabase();
}

describe('Users API resource', function() {

  // we need each of these hook functions to return a promise
  // otherwise we'd need to call a `done` callback. `runServer`,
  // `seedRestaurantData` and `tearDownDb` each return a promise,
  // so we return the value returned by these function calls.
  before(function() {
    return runServer(TEST_DATABASE_URL);
  });

  beforeEach(function() {
    return seedUserData();
  });

  afterEach(function() {
    return tearDownDb();
  });

  after(function() {
    return closeServer();
  });

  // note the use of nested `describe` blocks.
  // this allows us to make clearer, more discrete tests that focus
  // on proving something small
  describe('GET endpoint', function() {

    it('should return all existing users', function() {
      // strategy:
      //    1. get back all users returned by by GET request to `/users`
      //    2. prove res has right status, data type
      //    3. prove the number of restaurants we got back is equal to number
      //       in db.
      //
      // need to have access to mutate and access `res` across
      // `.then()` calls below, so declare it here so can modify in place
      let res;
      return chai.request(app)
        .get('/users')
        .then(function(_res) {
          // so subsequent .then blocks can access response object
          res = _res;
          expect(res).to.have.status(200);
          // otherwise our db seeding didn't work
          expect(res.body.users).to.have.length.of.at.least(1);
          return Users.count();
        })
        .then(function(count) {
          expect(res.body.users).to.have.length.of(count);
        });
    });


    it('should return users with right fields', function() {
      // Strategy: Get back all restaurants, and ensure they have expected keys

      let resUsers;
      return chai.request(app)
        .get('/users')
        .then(function(res) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body.users).to.be.a('array');
          expect(res.body.users).to.have.length.of.at.least(1);

          res.body.users.forEach(function(restaurant) {
            expect(user).to.be.a('object');
            expect(user).to.include.keys(
              'id', 'email', 'password', 'closing', 'created');
          });
          resRestaurant = res.body.restaurants[0];
          return Restaurant.findById(resRestaurant.id);
        })
        .then(function(restaurant) {
          expect(resUser.id).to.equal(user.id);
          expect(resUser.email).to.equal(user.email);
          expect(resUser.password).to.equal(user.password);
          expect(resUser.closing).to.equal(user.closing);
          expect(resUser.created).to.contain(user.created);
        });
    });
  });

  describe('POST endpoint', function() {
    // strategy: make a POST request with data,
    // then prove that the restaurant we get back has
    // right keys, and that `id` is there (which means
    // the data was inserted into db)
    it('should add a new restaurant', function() {

      const newUser = generateUserData();
      let mostRecentGrade;

      return chai.request(app)
        .post('/users')
        .send(newUser)
        .then(function(res) {
          expect(res).to.have.status(201);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.include.keys(
            'id', 'email', 'password', 'closing', 'created');
          expect(res.body.email).to.equal(newUsers.email);
          // cause Mongo should have created id on insertion
          expect(res.body.id).to.not.be.null;
          expect(res.body.password).to.equal(newUser.password);
          expect(res.body.closing).to.equal(newUser.closing);
          expect(res.body.created).to.not.be.null;
          return User.findById(res.body.id);
        })
        .then(function(user) {
          expect(user.email).to.equal(newUser.email);
          expect(user.password).to.equal(newUser.password);
          expect(user.closing).to.equal(newUser.closing);
          expect(user.created).to.equal(newUser.created);
        });
    });
  });

  describe('PUT endpoint', function() {

    // strategy:
    //  1. Get an existing restaurant from db
    //  2. Make a PUT request to update that restaurant
    //  3. Prove restaurant returned by request contains data we sent
    //  4. Prove restaurant in db is correctly updated
    it('should update fields you send over', function() {
      const updateData = {
        email: 'fofofofofofofof@ymail.com',
        password: 'abcd1234',
        closing: 'futuristic fusion'
      };

      return User
        .findOne()
        .then(function(user) {
          updateData.id = user.id;

          // make request then inspect it to make sure it reflects
          // data we sent
          return chai.request(app)
            .put(`/users/${user.id}`)
            .send(updateData);
        })
        .then(function(res) {
          expect(res).to.have.status(204);

          return User.findById(updateData.id);
        })
        .then(function(User) {
          expect(user.email).to.equal(updateData.email);
          expect(user.password).to.equal(updateData.password);
          expect(user.closing).to.equal(updateData.closing);
        });
    });
  });

  describe('DELETE endpoint', function() {
    // strategy:
    //  1. get a restaurant
    //  2. make a DELETE request for that restaurant's id
    //  3. assert that response has right status code
    //  4. prove that restaurant with the id doesn't exist in db anymore
    it('delete a restaurant by id', function() {

      let user;

      return User
        .findOne()
        .then(function(_user) {
          user = _user;
          return chai.request(app).delete(`/users/${user.id}`);
        })
        .then(function(res) {
          expect(res).to.have.status(204);
          return User.findById(user.id);
        })
        .then(function(_user) {
          expect(_user).to.be.null;
        });
    });
  });
});