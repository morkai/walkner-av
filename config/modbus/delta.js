exports.master = {
  timerFactor: 10,
  type: 'tcp',

  // connection
  host: '192.168.1.5',
  port: 502,
  autoConnect: true,
  autoReconnect: true,

  // transport
  timeout: 1000,
  maxTimeouts: 5,

  // master
  unit: 1,
  maxRetries: 0,
  interval: 30,
  maxConcurrentRequests: 1,
  requestOnReconnectDelay: 10
};

exports.transactions = [
  {
    id: 'outputs',
    fn: 0x01,
    address: 0x500 + 3,
    tags: ['dir', 'step'],
    writable: true,
    interval: 47
  },
  {
    id: 'markers',
    fn: 0x01,
    address: 0x800 + 100,
    tags: [
      'programRunning', 'runMode',
      'selectedProgram1', 'selectedProgram2'
    ],
    writable: true,
    interval: 13
  },
  {
    id: 'registers',
    fn: 0x03,
    address: 0x1000 + 2000,
    tags: [
      'temperature', 'light', 'voltage', 'current',
      '_', '_',
      'minTemperature', 'maxTemperature',
      'lampOnTimeout',
      'hrsCount', 'programTime', 'hrsInterval', 'hrsTime',
      'hrsIteration',
      'predefinedTime1', 'predefinedTime2'
    ],
    writable: true,
    interval: 99
  }
];

var minMaxAnalog = scaleToMinMax(0, 2047);
var scalePercent = scaleToPercent(0, 2047);
var fakeLight = 0;
var addFake = false;

function fakeAdd()
{
  addFake = !addFake;

  setTimeout(fakeAdd, Math.round(1000 + (Math.random() * 30000)));
}
fakeAdd();

exports.scalers = {
  temperature: {
    min: 0,
    max: 2047,
    scaler: function(rawValue)
    {
      return Math.round(minMaxAnalog(rawValue) * -.0589 + 119.43);
    }
  },
  light: {
    min: 0,
    max: 100,
    scaler: function(rawValue)
    {
      fakeLight = scalePercent(rawValue);

      return fakeLight;
    }
  },
  voltage: {
    min: 0,
    max: 2047,
    scaler: function(rawValue)
    {
      return 400 + (addFake ? 1 : 0);
    }
  },
  current: {
    min: 0,
    max: 2047,
    scaler: function(rawValue)
    {
      if (fakeLight === 0)
      {
        return 0;
      }
      if (fakeLight < 30)
      {
        return 12;
      }
      return 6;
    }
  }
};

function scaleToMinMax(min, max)
{
  return function(rawValue)
  {
    if (rawValue < min)
    {
      return min;
    }
    else if (rawValue > max)
    {
      return max;
    }

    return rawValue;
  };
}

function scaleToPercent(min, max)
{
  var minMax = scaleToMinMax(min, max);

  return function(rawValue)
  {
    return Math.round(minMax(rawValue) / max * 100);
  };
}
