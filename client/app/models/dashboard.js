// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of walkner-av <http://lukasz.walukiewicz.eu/p/walkner-av>

define(
[
  'app/time',
  'app/socket'
],
function(time, socket)
{
  var STATE_TO_CLASS_NAME = {
    success: 'programFinished',
    error: 'programErrored',
    stop: 'programStopped'
  };

  var program = window && window.PROGRAM ? window.PROGRAM : {};
  var tags = window && window.TAGS ? window.TAGS : {};
  var previousEntry =
    window && window.PREVIOUS_ENTRY ? window.PREVIOUS_ENTRY : null;

  delete window.PROGRAM;
  delete window.TAGS;
  delete window.PREVIOUS_ENTRY;

  var model = {
    MAX_VOLTAGE: 1000,
    program: program,
    tags: tags,
    stateText: 'Gotowy do pracy',
    previousEntry: preparePreviousEntry(previousEntry)
  };

  function preparePreviousEntry(previousEntry)
  {
    if (previousEntry)
    {
      var durationMs = new Date(previousEntry.finishedAt).getTime()
        - new Date(previousEntry.startedAt).getTime();

      previousEntry.duration = Math.round(durationMs / 1000);
      previousEntry.durationText = time.toString(previousEntry.duration);
      previousEntry.stateClassName =
        STATE_TO_CLASS_NAME[previousEntry.finishState];
    }

    return previousEntry;
  }

  var programExecutionTimer = null;

  function startProgramExecutionTimer()
  {
    if (typeof model.program.elapsedTime === 'number')
    {
      programExecutionTimer = setInterval(function()
      {
        model.program.elapsedTime += 1;
      }, 1000);
    }
  }

  function stopProgramExecutionTimer()
  {
    clearInterval(programExecutionTimer);
    programExecutionTimer = null;
  }

  socket.on('program changed', function(newProgram)
  {
    stopProgramExecutionTimer();

    model.program = newProgram;
  });

  socket.on('new history entry', function(newEntry)
  {
    model.previousEntry = preparePreviousEntry(newEntry);
  });

  socket.on('tags changed', function(changes)
  {
    for (var tag in changes)
    {
      tags[tag] = changes[tag];
    }

    if ('programRunning' in changes)
    {
      if (changes.programRunning)
      {
        model.stateText = 'Wykonywanie programu';
        model.program.elapsedTime = 0;

        startProgramExecutionTimer();
      }
      else
      {
        model.stateText = 'Gotowy do pracy';

        stopProgramExecutionTimer();
      }
    }
  });

  if (model.tags.programRunning)
  {
    startProgramExecutionTimer();
  }

  return model;
});
