'use strict';

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const feedbackTemplatesSchema = mongoose.Schema({
  lessonId: { 
    type: String, 
    required: true
  },
  text: {
    type: String, 
    required: true
  }
});

feedbackTemplatesSchema.methods.serialize = function() {
  return {
    id: this._id,
    lessonId: this.lessonId,
    text: this.text
  };
};

const FeedbackTemplates = mongoose.model('FeedbackTemplates', feedbackTemplatesSchema);
module.exports = { FeedbackTemplates };