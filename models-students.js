'use strict';

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const studentsSchema = mongoose.Schema({
  referenceId: {
  	type: String, 
  	required: false
  },
  userId: { 
  	type: String, 
  	required: true
  },
  name: {
  	type: String, 
  	required: true
  },
  nickName: {
  	type: String, 
  	default: ''
  },
  notes: {
  	type: String, 
  	default: ''
  },
  gender: {
    type: String, 
    required: false
  }
});

studentsSchema.methods.serialize = function() {
  return {
    id: this._id,
    referenceId: this.referenceId,
    userId: this.userId,
    name: this.name,
    nickName: this.nickName,
    notes: this.notes
  };
};

const Students = mongoose.model('Students', studentsSchema);
module.exports = {Students};












