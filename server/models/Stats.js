var mongoose = require('mongoose');

var Stats = module.exports = new mongoose.Schema({
  startedAt: {
    type: Date,
    required: true
  },
  finishedAt: {
    type: Date,
    required: false
  },
  passed: {
    type: Number
  },
  failed: {
    type: Number
  }
}, {
  strict: true
});

mongoose.model('Stats', Stats);
