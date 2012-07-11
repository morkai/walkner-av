exports.simulation = true;

exports.master = {
  timerFactor: 1,
  type: 'tcp',

  // connection
  host: '127.0.0.1',
  port: 502,
  autoConnect: true,
  autoReconnect: true,

  // transport
  timeout: 1000,
  maxTimeouts: 3,

  // master
  unit: 1,
  maxRetries: 0,
  interval: 0,
  maxConcurrentRequests: 1,
  requestOnReconnectDelay: 10
};

exports.transactions = [
  {
    id: 'outputs',
    fn: 0x01,
    address: 0,
    tags: ['dir', 'step'],
    writable: true,
    interval: 50
  },
  {
    id: 'markers',
    fn: 0x01,
    address: 10,
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
    address: 0,
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
    interval: 100
  }
];

var minMaxAnalog = scaleToMinMax(0, 2047);

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
    scaler: scaleToPercent(0, 2047)
  },
  voltage: {
    min: 0,
    max: 2047,
    scaler: minMaxAnalog
  },
  current: {
    min: 0,
    max: 2047,
    scaler: minMaxAnalog
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
