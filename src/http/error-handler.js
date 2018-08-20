'use strict'

const debug = require('debug')
const log = debug('jsipfs:http:error-handler')

module.exports = (server) => {
  server.ext('onPreResponse', (request, h) => {
    const res = request.response
    const req = request.raw.req

    let statusCode = 200
    let msg = 'Sorry, something went wrong, please retrace your steps.'
    let code = 1

    if (res.isBoom) {
      statusCode = res.output.payload.statusCode
      msg = res.output.payload.message

      if (res.data && res.data.code !== undefined) {
        code = res.data.code
      }

      if (res.message && res.isDeveloperError) {
        msg = res.message.replace('Uncaught error: ', '')
      }

      const debug = {
        method: req.method,
        url: request.url.path,
        headers: request.raw.req.headers,
        info: request.info,
        payload: request.payload,
        response: res.output.payload
      }

      log(res.stack)
      server.log('error', debug)

      return h.response({
        Message: msg,
        Code: code,
        Type: 'error'
      }).code(statusCode)
    }

    return h.continue
  })
}
