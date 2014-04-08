// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of walkner-av <http://lukasz.walukiewicz.eu/p/walkner-av>

var _ = require('underscore');
var mongoose = require('mongoose');

var HistoryEntry = module.exports = new mongoose.Schema({
  programId: {
    type: mongoose.SchemaTypes.ObjectId,
    required: true
  },
  programName: {
    type: String,
    required: true,
    trim: true
  },
  programTime: {
    type: Number,
    required: true
  },
  programRestrikeInterval: {
    type: Number,
    required: true
  },
  programRestrikeTime: {
    type: Number,
    required: true
  },
  programRestrikeCount: {
    type: Number,
    required: true
  },
  hrsIterations: {
    type: Number
  },
  runMode: {
    type: String,
    enum: ['manual', 'auto']
  },
  startedAt: {
    type: Date,
    required: true
  },
  finishedAt: {
    type: Date
  },
  finishState: {
    type: String,
    enum: ['success', 'stop', 'error']
  },
  errorMessage: {
    type: String
  },
  temperature: {
    type: [Number]
  },
  light: {
    type: [Number]
  },
  voltage: {
    type: [Number]
  },
  current: {
    type: [Number]
  }
}, {
  strict: true
});

function finish(id, state, data, cb)
{
  data.finishedAt = new Date();
  data.finishState = state;

  mongoose.model('HistoryEntry').update({_id: id}, data, cb || function() {});
};

HistoryEntry.statics.markInterruptedEntries = function(done)
{
  var condition = {finishState: {$exists: false}};
  var options = {multi: true};
  var data = {
    finishState: 'error',
    finishedAt: new Date(),
    errorMessage: 'Nagłe wyłączenie systemu.'
  };

  mongoose.model('HistoryEntry').update(condition, data, options, done);
};

HistoryEntry.statics.finished = function(id, error, cb)
{
  var data = {};

  if (_.isObject(error) && _.isString(error.message))
  {
    data.errorMessage = error.message;
  }
  else if (_.isString(error))
  {
    data.errorMessage = error;
  }

  finish(id, data.error ? 'error' : 'success', data, cb);
};

HistoryEntry.statics.stopped = function(id, cb)
{
  finish(id, 'stop', {}, cb);
};

mongoose.model('HistoryEntry', HistoryEntry);
