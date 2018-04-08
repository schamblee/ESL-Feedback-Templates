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
    required: false
  },
  notes: {
    type: String,
    required: false
  },
  pronoun: {
    type: String,
    required: false
  }
});

studentsSchema.methods.serialize = function() {
  return {
    id: this._id,
    referenceId: this.referenceId,
    name: this.name,
    nickName: this.nickName,
    notes: this.notes,
    pronoun: this.pronoun
  };
};


const Students = mongoose.model('Students', studentsSchema);

module.exports = {Students};
