var modbus = require('./modbus/mod_RSsim');

exports.master = modbus.master;

exports.simulation = modbus.simulation === true;

exports.scalers = modbus.scalers || {};

exports.transactions = modbus.transactions;

exports.serproxy = {
  enabled: false,
  cmd: 'C:/Programs/serproxy/serproxy.exe',
  args: ['C:/Programs/serproxy/serproxy.cfg']
};
