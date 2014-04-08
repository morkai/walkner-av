// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of walkner-av <http://lukasz.walukiewicz.eu/p/walkner-av>

var spawn = require('child_process').spawn;
var config = require('../../config/serproxy');
var serproxy;

function spawnSerproxy()
{
  if (serproxy)
  {
    console.debug('[serproxy] Restarting...');
  }
  else
  {
    console.debug('[serproxy] Starting...');
  }

  serproxy = spawn(config.cmd, config.args, config.opts);

  serproxy.stderr.setEncoding('utf8');
  serproxy.stderr.on('data', function(data)
  {
    if (data.indexOf('resource is locked') !== -1
      || data.indexOf('connection refused') !== -1)
    {
      serproxy.kill();
    }
  });

  serproxy.on('error', function(err)
  {
    console.error('[serproxy] %s', err.message);
  });

  serproxy.on('exit', function()
  {
    setTimeout(spawnSerproxy, 500);
  });
}

exports.boot = function(done)
{
  if (config.enabled)
  {
    spawnSerproxy();
  }

  done();
};
