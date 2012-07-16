var spawn = require('child_process').spawn;
var exec = require('child_process').exec;
var config = require('../../config/touchMonitor');

var RESTART_TIMEOUT = 3000;

var monitor;
var restartTimer;
var expectRestart = false;

function startTouchMonitor()
{
  if (monitor)
  {
    console.debug('[touch] Restarting monitor...');
  }
  else
  {
    console.debug('[touch] Starting monitor...');
  }

  monitor = spawn('tail', ['-n', '1', '-f', '/var/log/kern.log']);

  monitor.stdout.setEncoding('utf8');
  monitor.stdout.on('data', function(data)
  {
    if (expectRestart)
    {
      if (data.indexOf('input: EETI') !== -1)
      {
        clearTimeout(restartTimer);
        restartTimer = null;
        expectRestart = false;
      }
    }
    else if (data.indexOf('input: eGalax') !== -1)
    {
      expectRestart = true;
      restartTimer = setTimeout(restartDaemon, RESTART_TIMEOUT);
    }
  });

  monitor.on('exit', function()
  {
    setTimeout(startTouchMonitor, 1000);
  });
}

function restartDaemon()
{
  console.debug('[touch] Restarting eGTouchD...');

  exec('eGTouchD -f', function(err)
  {
    if (err)
    {
      console.error('[touch] Failed restarting eGTouchD :(');

      restartTimer = setTimeout(restartDaemon, RESTART_TIMEOUT);
    }
    else
    {
      console.debug('[touch] Restarted eGTouchD :)');

      restartTimer = null;
      expectRestart = false;
    }
  });
}

exports.boot = function(done)
{
  if (config.enabled)
  {
    startTouchMonitor();
  }
  
  done();
};
