// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-av project <http://lukasz.walukiewicz.eu/p/walkner-av>

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
