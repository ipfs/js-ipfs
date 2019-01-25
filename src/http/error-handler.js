'use strict'

module.exports = (server, log) => {
  server.ext('onPreResponse', (request, h) => {
    const res = request.response

    if (!res.isBoom) {
      return h.continue
    }

    const { statusCode, message } = res.output.payload
    const code = res.data && res.data.code != null ? res.data.code : 1

    if (statusCode >= 500) {
      const { req } = request.raw
      const debug = {
        method: req.method,
        url: request.url.path,
        headers: req.headers,
        info: request.info,
        payload: request.payload,
        response: res.output.payload
      }

      log(res)
      server.log('error', debug)
    }

    return h.response({
      Message: message,
      Code: code,
      Type: 'error'
    }).code(statusCode)
  })
}
