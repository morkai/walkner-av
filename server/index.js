// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of walkner-av <http://lukasz.walukiewicz.eu/p/walkner-av>

require('./utils/logging');

process.on('uncaughtException', function(err)
{
  console.error('Uncaught exception:\n%s', err.stack);
});

var PID_FILE = __dirname + '/../var/pids/server.pid';
var MODULES = [
  'models',
  'controller',
  'routing',
  'stats',
  'interfaceMonitor',
  'serproxy',
  'touchMonitor'
];

var fs = require('fs');
var express = require('express');
var MongoStore = require('connect-mongodb');
var io = require('socket.io');
var mongoose = require('mongoose');
var step = require('step');

fs.unlink(PID_FILE, function() {});

(function()
{
  var oldBuildDoc = mongoose.Document.prototype.buildDoc;

  mongoose.Document.prototype.buildDoc = function(fields)
  {
    this.fields = fields || {};

    return oldBuildDoc.call(this, fields);
  };
})();

var expressConfig = require('../config/express');
var mongooseConfig = require('../config/mongoose');

app = express.createServer();

step(
  function connectToDbStep()
  {
    console.debug('Starting...');
    console.debug('Connecting to MongoDB...');

    var next = this;

    function tryToConnect()
    {
      mongoose.connect(mongooseConfig.uri, function(err)
      {
        if (err)
        {
          setTimeout(tryToConnect, 250);
        }
        else
        {
          next();
        }
      });
    }

    tryToConnect();
  },
  function listenStep()
  {
    console.debug('Connected to MongoDB!');

    var next = this;
    var listenTimer = setTimeout(
      function()
      {
        console.error(
          "Couldn't start the HTTP server. %d port is locked?",
          expressConfig.port
        );
        process.exit();
      },
      1000
    );

    app.listen(expressConfig.port, function()
    {
      clearTimeout(listenTimer);
      next();
    });
  },
  function bootModules(err)
  {
    console.debug(
      'Express HTTP server listening on port %d!', app.address().port
    );

    var group = this.group();

    MODULES.forEach(function(moduleName)
    {
      require('./modules/' + moduleName).boot(group());
    });
  },
  function startBrowser()
  {
    if (app.settings.env === 'production')
    {
      var config = require('../config/browser.js');

      console.debug('Starting the Internet browser.');

      require('child_process').exec(config.cmd);
    }

    return true;
  },
  function markInterruptedHistoryEntries()
  {
    var next = this;

    app.db.model('HistoryEntry').markInterruptedEntries(function(err, count)
    {
      if (count)
      {
        console.info('Marked %d history entries as interrupted.', count);
      }

      next();
    });
  },
  function startStep()
  {
    fs.writeFile(PID_FILE, process.pid);

    console.info('Started in `%s` environment!', app.settings.env);

    app.startTime = Date.now();
  }
);

app.db = mongoose;

app.io = io.listen(app, {
  log: false
});

app.configure(function()
{
  app.set('views', __dirname + '/templates/');

  app.use(express.cookieParser());
  app.use(express.session({
    secret: '~`z@!#X!@: >#x21"4va',
    store: new MongoStore({db: app.db.connection.db})
  }));
  app.use(express.methodOverride());
  app.use(express.bodyParser());
  app.use(app.router);
});

app.configure('development', function()
{
  app.use(express.static(__dirname + '/../client'));
  app.use(express.errorHandler({dumpExceptions: true, showStack: true}));
});

app.configure('production', function()
{
  app.use(express.static(__dirname + '/../client-build'));
  app.use(express.errorHandler());

  app.io.enable('browser client minification');
  app.io.enable('browser client etag');
  app.io.enable('browser client gzip');
});

