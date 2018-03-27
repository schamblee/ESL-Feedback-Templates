'use strict';

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const feedbackSchema = mongoose.Schema({
  lessonId: {type: String, required: true},
  userId: { type: String, required: true},
  studentId: { type: String, required: true},
  text: { type: String, required: true},
  created: {type: Date, default: Date.now}
});

feedbackSchema.methods.serialize = function() {
  return {
    id: this._id,
    lessonId: this.lessonId,
    userId: this.userId,
    studentId: this.studentId,
    text: this.text,
    created: this.created
  };
};


const Feedback = mongoose.model('Feedback', feedbackSchema);


module.exports = {Feedback}











