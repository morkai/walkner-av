/**
 * Whether to monitor the network interface.
 *
 * @type {Boolean}
 */
exports.enabled = process.platform === 'linux';

/**
 * An IP address to look for in `stdout` of `checkCmd`.
 *
 * @type {String}
 */
exports.ipAddress = '192.168.1.33';

/**
 * A command that returns the current IP address of the monitored
 * network interface.
 *
 * @type {String}
 */
exports.checkCmd = 'ifconfig eth0';

/**
 * A command executed if the `ipAddress` could not be found
 * in `stdout` of `checkCmd`.
 *
 * @type {String}
 */
exports.restartCmd = 'ifconfig eth0 down && ifconfig eth0 up';

/**
 * A number of milliseconds between `checkCmd` executions.
 *
 * @type {Number}
 */
exports.interval = 2500;
