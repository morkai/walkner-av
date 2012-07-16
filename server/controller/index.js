var util = require('util');
var net = require('net');
var config = require('../../config/controller');
var stats = require('../modules/stats');

exports.currentProgram = null;
exports.currentEntry = null;
exports.previousEntry = null;
exports.hrsIterations = 0;
exports.tags = {
  connected: 0
};

var collectedData;

var simTimers = [];

function simTimer(to, func)
{
  simTimers.push(setTimeout(func, to));
}

function startSimulation(program)
{
  if (!config.simulation)
  {
    return;
  }

  console.debug('Starting simulation...');

  exports.setTagValue('light', 2047);
  exports.setTagValue('hrsIteration', 0);

  var timeOffset = +program.get('time') * 1000;
  var iteration = 0;

  for (var i = 0, l = +program.get('restrikeCount'); i < l; ++i)
  {
    simTimer(timeOffset, function()
    {
      exports.setTagValue('light', 0);
    });

    timeOffset += program.get('restrikeInterval') * 1000;

    simTimer(timeOffset, function()
    {
      exports.setTagValue('light', 2047);
    });

    timeOffset += program.get('restrikeTime') * 1000;

    simTimer(timeOffset, (function(iter)
    {
      return function()
      {
        exports.setTagValue('hrsIteration', iter);
      };
    })(++iteration));
  }

  simTimer(timeOffset, function()
  {
    exports.setTagValue('light', 0);
    exports.setTagValue('programRunning', 0);
  });
}

function handleProgramStart()
{
  var startedAt = new Date();

  var program = exports.currentProgram;
  var HistoryEntry = app.db.model('HistoryEntry');

  var historyEntry = new HistoryEntry({
    programId: program.get('id'),
    programName: program.get('name'),
    programTime: +program.get('time'),
    programRestrikeInterval: +program.get('restrikeInterval'),
    programRestrikeTime: +program.get('restrikeTime'),
    programRestrikeCount: +program.get('restrikeCount'),
    startedAt: startedAt,
    runMode: exports.tags.runMode === 0 ? 'manual' : 'auto'
  });
  historyEntry.save();

  exports.currentEntry = historyEntry;
  exports.hrsIterations = 0;

  startCollectingData();

  console.info('Started program: %s', historyEntry.get('programName'));

  startSimulation(program);
}

function handleProgramStop(finishedAt)
{
  if (simTimers.length > 0)
  {
    exports.setTagValue('light', 0);

    simTimers.forEach(function(t) { clearTimeout(t); });
    simTimers = [];
  }

  var currentEntry = exports.currentEntry;

  if (!currentEntry)
  {
    return;
  }

  stopCollectingData();

  var requiredIterations = +currentEntry.get('programRestrikeCount');
  var actualIterations = exports.hrsIterations;
  var elapsedTime =
    (finishedAt.getTime() - currentEntry.get('startedAt').getTime())
      / 1000;
  var finishState = 'success';

  if (elapsedTime < +currentEntry.get('programTime')
    || actualIterations !== requiredIterations)
  {
    finishState = 'stop';
  }

  currentEntry.set({
    finishedAt: finishedAt,
    finishState: finishState,
    temperature: collectedData.temperature,
    light: collectedData.light,
    voltage: collectedData.voltage,
    current: collectedData.current,
    hrsIterations: actualIterations
  });
  currentEntry.save();

  exports.previousEntry = {
    id: currentEntry.get('id'),
    startedAt: currentEntry.get('startedAt'),
    finishedAt: currentEntry.get('finishedAt'),
    finishState: currentEntry.get('finishState'),
    programName: currentEntry.get('programName')
  };
  exports.currentEntry = null;
  exports.hrsIterations = 0;

  collectedData = null;

  console.info(
    'Program [%s] stopped with state: %s',
    exports.previousEntry.programName,
    finishState
  );

  app.io.sockets.emit('new history entry', exports.previousEntry);

  stats.adjust(finishState === 'stop' ? 'failed' : 'passed', 'increase');
}

function handleTagChanges(changes)
{

  app.io.sockets.emit('tags changed', changes);

  if ('programRunning' in changes)
  {
    if (changes.programRunning)
    {
      handleProgramStart();
    }
    else
    {
      var finishedAt = new Date();

      setTimeout(function() { handleProgramStop(finishedAt); }, 250);
    }
  }

  if ('hrsIteration' in changes)
  {
    exports.hrsIterations = changes.hrsIteration;
  }

  if ('selectedProgram1' in changes || 'selectedProgram2' in changes)
  {
    handleSelectedProgramChange();
  }
}

function isSelectedProgram1()
{
  return exports.tags.selectedProgram1 === 1
    && exports.tags.selectedProgram2 === 0;
}

function isSelectedProgram2()
{
  return exports.tags.selectedProgram1 === 0
    && exports.tags.selectedProgram2 === 0;
}

function isSelectedAssignedProgram()
{
  return !isSelectedProgram1() && !isSelectedProgram2();
}

function handleSelectedProgramChange()
{
  if (exports.tags.programRunning)
  {
    return;
  }

  var conditions = {};

  if (isSelectedProgram1())
  {
    conditions.predefined = 1;
  }
  else if (isSelectedProgram2())
  {
    conditions.predefined = 2;
  }
  else
  {
    conditions.assigned = true;
  }

  app.db.model('Program').findOne(conditions, function(err, program)
  {
    if (err)
    {
      return console.error(err.stack);
    }

    exports.currentProgram = program;

    app.io.sockets.emit('program changed', program);
  });
}

function changeTag(tag, value)
{
  if (exports.tags[tag] !== value)
  {
    exports.tags[tag] = value;

    var changes = {};
    changes[tag] = value;

    handleTagChanges(changes);
  }
}

function startCollectingData()
{
  collectedData = {
    temperature: [],
    light: [],
    voltage: [],
    current: [],
    timer: null
  };

  function collectData()
  {
    ['temperature', 'light', 'voltage', 'current'].forEach(function(tag)
    {
      collectedData[tag].push(exports.tags[tag]);
    });
  }

  collectedData.timer = setInterval(collectData, 1000);

  collectData();
}

function stopCollectingData()
{
  clearInterval(collectedData.timer);
}

function sendProgram(done)
{
  app.db.model('Program').findOne({assigned: true}, function(err, program)
  {
    if (!err && program
      && !exports.tags.programRunning && exports.tags.connected)
    {
      exports.program(program, function(err)
      {
        done && done(err);
      });
    }
    else
    {
      done && done(err);
    }
  });
}

function sendPredefinedPrograms(done)
{
  app.db.model('Program')
    .find({predefined: {$ne: 0}}, {predefined: 1, time: 1})
    .run(function(err, predefinedPrograms)
    {
      if (!err && !exports.tags.programRunning && exports.tags.connected)
      {
        var tags = {};

        predefinedPrograms.forEach(function(predefinedProgram)
        {
          tags['predefinedTime' + predefinedProgram.get('predefined')]
            = predefinedProgram.get('time') * (config.master.timerFactor || 1);
        });

        master.setTagValues(tags, done);
      }
      else
      {
        done && done(err);
      }
    });
}

var master = require('./master');

master.on('connect', function()
{
  changeTag('connected', 1);

  setTimeout(
    function()
    {
      sendProgram();
      sendPredefinedPrograms();
    },
    500
  );
});

master.on('disconnect', function()
{
  for (var tag in exports.tags)
  {
    exports.tags[tag] = -1;
  }

  changeTag('connected', 0);
});

master.setUpTransactions(exports.tags, handleTagChanges);

exports.setTagValue = master.setTagValue;
exports.setTagValues = master.setTagValues;

exports.program = function(program, done)
{
  var timerFactor = config.master.timerFactor || 1;
  var tags = {
    hrsCount: +program.get('restrikeCount'),
    programTime: +program.get('time') * timerFactor,
    hrsInterval: +program.get('restrikeInterval') * timerFactor,
    hrsTime: +program.get('restrikeTime') * timerFactor
  };

  master.setTagValues(tags, done);

  if (isSelectedAssignedProgram())
  {
    app.io.sockets.emit('program changed', program);
  }
};

exports.predefine = function(no, time, done)
{
  var timerFactor = config.master.timerFactor || 1;

  master.setTagValue('predefinedTime' + no, parseInt(time) * timerFactor, done);
};

app.io.sockets.on('connection', function(socket)
{
  socket.on('set tag', master.setTagValue);
  socket.on('set tags', master.setTagValues);
});
