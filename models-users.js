'use strict';

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const usersSchema = mongoose.Schema({
  email: {type: String, required: true},
  password: { type: String, required: true},
  closing: {type: String, required: false},
  created: {type: Date, default: Date.now}
});

usersSchema.methods.serialize = function() {
  return {
    id: this._id,
    email: this.email,
    password: this.password,
    closing: this.closing,
    created: this.created
  };
};

const Users = mongoose.model('Users', usersSchema);
module.exports = {Users};











