var spawn = require('child_process').spawn;
var config = require('../../config/controller');
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

  serproxy = spawn(config.serproxy.cmd, config.serproxy.args);

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

exports.start = spawnSerproxy;
