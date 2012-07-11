var modbus = require('./modbus/mod_RSsim');

exports.master = modbus.master;

exports.simulation = modbus.simulation === true;

exports.scalers = modbus.scalers || {};

exports.transactions = modbus.transactions;

exports.interfaceMonitor = {
  enabled: false,
  ipAddress: '192.168.1.33',
  checkCmd: 'ifconfig eth0',
  restartCmd: 'ifconfig eth0 down && ifconfig eth0 up',
  interval: 2500
};

exports.serproxy = {
  enabled: false,
  cmd: 'C:/Programs/serproxy/serproxy.exe',
  args: ['C:/Programs/serproxy/serproxy.cfg']
};
