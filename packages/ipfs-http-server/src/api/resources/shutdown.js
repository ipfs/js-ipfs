
/*
 * Stop the daemon.
 *
 * Returns an empty response to the caller then
 * on the next 'tick' emits SIGTERM.
 */
export const shutdownResource = {
  /**
   * @param {import('../../types').Request} _request
   * @param {import('@hapi/hapi').ResponseToolkit} h
   */
  handler: (_request, h) => {
    setImmediate(() => process.emit('SIGTERM', 'SIGTERM'))
    return h.response()
  }
}
