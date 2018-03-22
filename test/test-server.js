'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../server.js');

const expect = chai.expect;

chai.use(chaiHttp);

describe('index page', function () {
  it('should exist', function () {
    return chai.request(app)
      .get('/')
      .then(function (res) {
        expect(res).to.have.status(200);
      });
  });
});

describe('feedback page', function () {
  it('should exist', function () {
    return chai.request(app)
      .get('/feedback')
      .then(function (res) {
        expect(res).to.have.status(200);
      });
  });
});

describe('register page', function () {
  it('should exist', function () {
    return chai.request(app)
      .get('/register')
      .then(function (res) {
        expect(res).to.have.status(200);
      });
  });
});