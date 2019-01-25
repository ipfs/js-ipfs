'use strict'

exports = module.exports

/*
 * Stop the daemon.
 *
 * Returns an empty response to the caller then
 * on the next 'tick' emits SIGTERM.
 */
exports.do = (request, h) => {
  setImmediate(() => process.emit('SIGTERM'))
  return h.response()
}
