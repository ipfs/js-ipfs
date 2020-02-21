'use strict'

/*
 * Stop the daemon.
 *
 * Returns an empty response to the caller then
 * on the next 'tick' emits SIGTERM.
 */
module.exports = (request, h) => {
  setImmediate(() => process.emit('SIGTERM'))
  return h.response()
}
