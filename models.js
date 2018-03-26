'use strict';

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

/*//USERS COLLECTION

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

//LESSONS COLLECTION

const lessonsSchema = mongoose.Schema({
  referenceId: {type: Number, required: true}, //located in the classroom URL on VIPKID
  code: {type: String, required: true},
  name: { type: String, required: true},
  templateId: {type: Number, required: true}
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

//STUDENTS COLLECTION

const studentsSchema = mongoose.Schema({
  referenceId: {type: Number, required: false},
  userId: { type: Number, required: true},
  name: {type: String, required: true}
});

studentsSchema.methods.serialize = function() {
  return {
    id: this._id,
    referenceId: this.referenceId,
    userId: this.userId,
    name: this.name
  };
};*/

//FEEDBACK TEMPLATES COLLECTION

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

const Users = mongoose.model('Users', usersSchema);
const Lessons = mongoose.model('Lessons', lessonsSchema);
const Students = mongoose.model('Students', studentsSchema);*/
const FeedbackTemplates = mongoose.model('FeedbackTemplates', feedbackTemplatesSchema);
//const Feedback = mongoose.model('Feedback', feedbackSchema);

//module.exports = {Users};
//module.exports = {Lessons};
//module.exports = {Students};
module.exports = {FeedbackTemplates}
//module.exports = {Feedback}











