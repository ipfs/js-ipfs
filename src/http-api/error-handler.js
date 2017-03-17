'use strict'

const Hoek = require('hoek')

module.exports = (api, server) => {
  server.ext('onRequest', (request, reply) => {
    request.handleError = handleError
    reply.continue()
  })

  server.ext('onPreResponse', (request, reply) => {
    const res = request.response
    const req = request.raw.req

    let statusCode = 200
    let msg = 'Sorry, something went wrong, please retrace your steps.'

    if (res.isBoom) {
      statusCode = res.output.payload.statusCode

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

      api.log.error(res.stack)
      server.log('error', debug)

      reply({
        Message: msg,
        Code: 1
      }).code(statusCode)
      return
    }

    reply.continue()
  })
}

function handleError (error, errorMessage) {
  if (errorMessage) {
    return Hoek.assert(!error, errorMessage)
  }

  return Hoek.assert(!error, error)
}
