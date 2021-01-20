'use strict'

const bidiToDuplex = require('./bidi-to-duplex')

/**
 * @typedef {import('http').Agent} HttpAgent
 * @typedef {import('https').Agent} HttpsAgent
 */

/**
 * Server stream methods are one-to-many operations so this
 * function accepts a client message and returns a source
 * from which multiple server messages can be read.
 *
 * @param {object} grpc - an @improbable-eng/grpc-web instance
 * @param {object} service - an @improbable-eng/grpc-web service
 * @param {object} request - a request object
 * @param {object} options - RPC options
 * @param {string} options.host - The remote host
 * @param {boolean} [options.debug] - Whether to print debug messages
 * @param {object} [options.metadata] - Metadata sent as headers
 * @param {HttpAgent|HttpsAgent} [options.agent] - http.Agent used to control HTTP client behaviour (node.js only)
 * @returns {AsyncIterable<object>}
 **/
module.exports = function serverStreamToIterator (grpc, service, request, options) {
  const {
    source, sink
  } = bidiToDuplex(grpc, service, options)

  sink.push(request)

  return source
}
