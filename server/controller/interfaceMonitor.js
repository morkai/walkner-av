var exec = require('child_process').exec;
var config = require('../../config/controller').interfaceMonitor;

function startInterfaceMonitor()
{
  setTimeout(monitorInterface, config.interval);
}

function monitorInterface()
{
  hasIpAddress(function(err, result)
  {
    if (err || result)
    {
      return startInterfaceMonitor();
    }

    return restartInterface();
  });
}

function hasIpAddress(done)
{
  exec(config.checkCmd, function(err, stdout)
  {
    if (err)
    {
      return done(err);
    }

    if (typeof stdout !== 'string' || stdout.length < '1.1.1.1'.length)
    {
      return done(null, false);
    }
    
    return done(null, stdout.indexOf(config.ipAddress) !== -1);
  });
}

function restartInterface()
{
  exec(config.restartCmd, startInterfaceMonitor);
}

exports.start = startInterfaceMonitor;
