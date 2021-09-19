
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
    // @ts-ignore - TS expects second argument
    setImmediate(() => process.emit('SIGTERM'))
    return h.response()
  }
}
