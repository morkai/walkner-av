// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of walkner-av <http://lukasz.walukiewicz.eu/p/walkner-av>

/**
 * @type {Stats}
 */
exports.current = null;

exports.adjust = function(type, action)
{
  var stats = exports.current;

  switch (action)
  {
    case 'reset':
      stats[type] = 0;
      break;

    case 'increase':
      stats[type].$inc();
      break;

    case 'decrease':
      stats[type].$inc(-1);
      break;
  }

  stats.save(function(err, stats)
  {
    if (err)
    {
      console.error(err.stack);
    }
    else
    {
      var changes = {};
      changes[type] = stats[type];

      app.io.sockets.emit('adjust stats', changes);
    }
  });
};

exports.boot = function(done)
{
  var Stats = app.db.model('Stats');

  Stats.findOne({finishedAt: {$exists: false}}, function(err, stats)
  {
    if (err)
    {
      throw err;
    }

    if (!stats)
    {
      stats = new Stats({
        startedAt: new Date(),
        passed: 0,
        failed: 0
      });
      stats.save();
    }

    exports.current = stats;
  });

  app.io.sockets.on('connection', function(socket)
  {
    socket.on('new shift', function()
    {
      var now = new Date();

      exports.current.set({
        finishedAt: now
      });
      exports.current.save();

      exports.current = new Stats({
        startedAt: now,
        passed: 0,
        failed: 0
      });
      exports.current.save();

      app.io.sockets.emit('adjust stats', exports.current.toJSON());
    });

    socket.on('adjust stats', exports.adjust);
  });

  console.debug('Started the stats module!');

  done();
};
