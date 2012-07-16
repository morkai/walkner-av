/**
 * Whether to spawn the process.
 *
 * @type {Boolean}
 */
exports.enabled = false;

/**
 * A command to execute if `enabled` is `TRUE`.
 *
 * @type {String}
 */
exports.cmd = 'C:/Programs/serproxy/serproxy.exe';

/**
 * An array of command arguments.
 *
 * @type {Array}
 */
exports.args = ['C:/Programs/serproxy/serproxy.cfg'];

/**
 * `child_process.spawn` options.
 *
 * @type {Object}
 */
exports.opts = {
  cwd: 'C:/Programs/serproxy'
};
