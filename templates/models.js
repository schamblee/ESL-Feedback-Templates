'use strict';

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const templatesSchema = mongoose.Schema({
  text: {
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
  referenceId: {
    type: String, 
    default: ''
  }
});

templatesSchema.methods.serialize = function() {
  return {
    id: this._id,
    code: this.code,
    name: this.name,
    text: this.text,
    referenceId: this.referenceId
  };
};

const Templates = mongoose.model('Templates', templatesSchema);
module.exports = { Templates };