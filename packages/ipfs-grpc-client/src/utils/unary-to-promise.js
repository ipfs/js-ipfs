'use strict'

const errCode = require('err-code')

/**
 * @param {object} grpc - an @improbable-eng/grpc-web instance
 * @param {object} service - an @improbable-eng/grpc-web service
 * @param {object} options - options to pass as headers
 * @returns {Promise<object>} - a response object
 **/
module.exports = (grpc, service, options) => {
  return new Promise((resolve, reject) => {
    grpc.unary(service, {
      ...options,
      onEnd: ({ status, statusMessage, headers, message, trailers }) => {
        if (status) {
          const error = new Error(message)

          return reject(errCode(error, trailers.get('grpc-code'), {
            stack: trailers.get('grpc-stack') || error.stack,
            status
          }))
        }

        resolve(message.toObject())
      }
    })
  })
}
