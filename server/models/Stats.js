// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of walkner-av <http://lukasz.walukiewicz.eu/p/walkner-av>

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
