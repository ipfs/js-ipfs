'use strict'

/*
 * Stop the daemon.
 *
 * Returns an empty response to the caller then
 * on the next 'tick' emits SIGTERM.
 */
module.exports = {
  handler: (_request, h) => {
    // @ts-ignore - TS expects second argument
    setImmediate(() => process.emit('SIGTERM'))
    return h.response()
  }
}
