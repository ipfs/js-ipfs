import { bidiToDuplex } from './bidi-to-duplex.js'

/**
 * @typedef {import('http').Agent} HttpAgent
 * @typedef {import('https').Agent} HttpsAgent
 */

/**
 * Server stream methods are one-to-many operations so this
 * function accepts a client message and returns a source
 * from which multiple server messages can be read.
 *
 * @param {import('@improbable-eng/grpc-web').grpc} grpc - an @improbable-eng/grpc-web instance
 * @param {*} service - an @improbable-eng/grpc-web service
 * @param {object} request - a request object
 * @param {import('../types').RPCOptions<any>} options - RPC options
 * @returns {AsyncIterable<any>}
 **/
export function serverStreamToIterator (grpc, service, request, options) {
  const {
    source, sink
  } = bidiToDuplex(grpc, service, options)

  sink.push(request)

  return source
}
