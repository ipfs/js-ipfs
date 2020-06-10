'use strict'

/*
 * Stop the daemon.
 *
 * Returns an empty response to the caller then
 * on the next 'tick' emits SIGTERM.
 */
module.exports = {
  handler: (request, h) => {
    setImmediate(() => process.emit('SIGTERM'))
    return h.response()
  }
}
