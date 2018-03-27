'use strict';

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;


const lessonsSchema = mongoose.Schema({
  referenceId: {type: String, required: true}, //located in the classroom URL on VIPKID
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

const Lessons = mongoose.model('Lessons', lessonsSchema);
module.exports = {Lessons};












