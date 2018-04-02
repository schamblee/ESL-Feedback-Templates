'use strict';

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const lessonsSchema = mongoose.Schema({
  referenceId: {
    type: String, 
    required: true
  }, 
  code: {
    type: String, 
    required: true
  },
  name: { 
    type: String, 
    required: true
  },
  templateId: {
    type: String, 
    required: true
  }
});

lessonsSchema.methods.serialize = function() {
  return {
    id: this._id,
    referenceId: this.referenceId,
    code: this.code,
    name: this.name,
    templateId: this.templateId
  };
};

const Lessons = mongoose.model('Lessons', lessonsSchema);
module.exports = {Lessons};
