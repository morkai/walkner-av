var mongoose = require('mongoose');

var Program = module.exports = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  time: {
    type: Number,
    required: true
  },
  assigned: {
    type: Boolean,
    default: false
  },
  restrikeInterval: {
    type: Number,
    default: 0
  },
  restrikeTime: {
    type: Number,
    default: 0
  },
  restrikeCount: {
    type: Number,
    default: 0
  },
  predefined: {
    type: Number,
    default: 0
  }
}, {
  strict: true
});

mongoose.model('Program', Program);
