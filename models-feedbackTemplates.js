'use strict';

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;



const feedbackTemplatesSchema = mongoose.Schema({
  lessonId: { type: String, required: true},
  text: {type: String, required: true}
});

feedbackTemplatesSchema.methods.serialize = function() {
  return {
    id: this._id,
    lessonId: this.lessonId,
    text: this.text
  };
};

//FEEDBACK COLLECTION
/*
const feedbackSchema = mongoose.Schema({
  lessonId: {type: Number, required: true},
  userId: { type: Number, required: true},
  studentId: { type: Number, required: true},
  text: { type: Number, required: true},
  created: {type: Date, required: true}
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
*/
//const users = mongoose.model('users', usersSchema);




const FeedbackTemplates = mongoose.model('FeedbackTemplates', feedbackTemplatesSchema);
//const Feedback = mongoose.model('Feedback', feedbackSchema);

module.exports = {FeedbackTemplates};

//module.exports = {Feedback}











