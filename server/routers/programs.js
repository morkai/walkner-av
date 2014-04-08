// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-av project <http://lukasz.walukiewicz.eu/p/walkner-av>

var step = require('step');
var auth = require('../utils/middleware').auth;
var controller = require('../controller');

app.get('/programs', auth('viewPrograms'), function(req, res, next)
{
  var Program = app.db.model('Program');

  var conditions = req.query.conditions || {};
  var fields = req.query.fields;

  Program.find(conditions, fields).asc('name').run(function(err, docs)
  {
    if (err)
    {
      return next(err);
    }

    res.send(docs);
  });
});

app.post('/programs', auth('managePrograms'), function(req, res, next)
{
  var Program = app.db.model('Program');

  Program.count(function(err, count)
  {
    if (err)
    {
      return next(err);
    }

    var program = new Program(req.body);

    program.save(function(err)
    {
      if (err)
      {
        return next(err);
      }

      res.send(program, 201);
    });
  });
});

app.get('/programs/:id', auth('viewPrograms'), function(req, res, next)
{
  var Program = app.db.model('Program');

  Program.findById(req.params.id, function(err, doc)
  {
    if (err)
    {
      return next(err);
    }

    if (!doc)
    {
      return res.send(404);
    }

    res.send(doc);
  });
});

app.put('/programs/:id;assign', auth('assignDefaultProgram'),
  function(req, res, next)
  {
    var Program = app.db.model('Program');
    var program;

    step(
      function findNewProgram()
      {
        Program.findOne({_id: req.params.id}, this);
      },
      function setProgramTime(err, newProgram)
      {
        if (err)
        {
          throw err;
        }

        program = newProgram;

        controller.program(program, this);
      },
      function unassignOldProgram(err)
      {
        if (err)
        {
          throw err;
        }

        Program.update({assigned: true}, {assigned: false}, this);
      },
      function assignNewProgram(err)
      {
        if (err)
        {
          throw err;
        }

        Program.update({_id: req.params.id}, {assigned: true}, this);
      },
      function sendResponse(err, count)
      {
        if (err)
        {
          return next(err);
        }

        if (!count)
        {
          return res.send(404);
        }

        res.send(204);
      }
    );
  });

app.put('/programs/:id', auth('managePrograms'), function(req, res, next)
{
  var currentEntry = controller.currentEntry;

  if (currentEntry && currentEntry.get('id').toString() === req.params.id)
  {
    return res.send("Nie można modyfikować uruchomionego programu :(", 400);
  }

  var Program = app.db.model('Program');

  var data = req.body;
  delete data._id;

  var oldProgram;
  var newProgram;

  function findSpecifiedProgram(done)
  {
    Program.findOne({_id: req.params.id}, function(err, program)
    {
      newProgram = program;

      done(err);
    });
  }

  function findOldPredefinedProgram(err)
  {
    if (err) throw err;

    var nextStep = this;

    Program.findOne({predefined: data.predefined}, function(err, program)
    {
      if (program && program.get('id').toString() !== req.params.id)
      {
        oldProgram = program;
      }

      nextStep(err);
    });
  }

  function checkIfOldPredefinedProgramIsRunning(err)
  {
    if (err) throw err;

    var nextStep = this;

    if (!oldProgram)
    {
      return nextStep();
    }

    var predefId = oldProgram.get('id').toString();
    var runningId = currentEntry
      ? currentEntry.get('programId').toString()
      : '';

    if (predefId === runningId)
    {
      throw "Nie można zmienić predefiniowanego programu podczas jego wykonywania!";
    }

    return nextStep();
  }

  function updateOldPredefinedProgram(err)
  {
    if (err) throw err;

    var nextStep = this;

    if (oldProgram)
    {
      oldProgram.set({predefined: 0});
      oldProgram.save(nextStep);
    }
    else
    {
      nextStep();
    }
  }

  function updateProgram(err)
  {
    if (err) throw err;

    newProgram.set(data);
    newProgram.save(this);
  }

  function sendNewPredefinedProgramTime(err)
  {
    if (err) throw err;

    var nextStep = this;

    if (controller.tags.connected)
    {
      controller.predefine(data.predefined, data.time, function(err)
      {
        if (err)
        {
          console.error(
            "Failed to write a program time for the predefined program #%d: %s",
            data.predefined,
            err.message ? err.message : err
          );
        }

        nextStep();
      });
    }
    else
    {
      nextStep();
    }
  }

  function sendUpdatedProgram(err)
  {
    if (err) throw err;

    var nextStep = this;
    var newProgramId = newProgram.get('id').toString();

    if (!controller.currentProgram
      || controller.currentProgram.get('id').toString() !== newProgramId)
    {
      return nextStep();
    }

    if (currentEntry && currentEntry.get('id').toString() === newProgramId)
    {
      return nextStep();
    }

    controller.program(newProgram, nextStep);
  }

  function sendResponse(err)
  {
    if (err)
    {
      return next(err);
    }

    res.send(204);

    if (controller.currentProgram
      && controller.currentProgram.get('id') === newProgram.get('id'))
    {
      controller.currentProgram = newProgram;

      app.io.sockets.emit('program changed', newProgram);
    }
  }

  findSpecifiedProgram(function(err)
  {
    if (err)
    {
      return next(err);
    }

    if (!newProgram)
    {
      return res.send(404);
    }

    if (data.predefined === 1 || data.predefined === 2)
    {
      step(
        findOldPredefinedProgram,
        checkIfOldPredefinedProgramIsRunning,
        updateOldPredefinedProgram,
        updateProgram,
        sendNewPredefinedProgramTime,
        sendResponse
      );
    }
    else
    {
      data.predefined = 0;

      step(
        updateProgram,
        sendUpdatedProgram,
        sendResponse
      );
    }
  });
});

app.del('/programs/:id', auth('managePrograms'), function(req, res, next)
{
  var Program = app.db.model('Program');

  Program.findOne({_id: req.params.id}, {predefined: 1}, function(err, program)
  {
    if (err)
    {
      return next(err);
    }

    if (+program.get('predefined') !== 0)
    {
      return res.send("Nie można usunąć predefiniowanego programu!", 400);
    }

    program.remove(function(err)
    {
      if (err)
      {
        return next(err);
      }

      res.send(204);
    });
  });
});
