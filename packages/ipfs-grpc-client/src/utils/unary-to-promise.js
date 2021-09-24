import first from 'it-first'
import { bidiToDuplex } from './bidi-to-duplex.js'

/**
 * @typedef {import('http').Agent} HttpAgent
 * @typedef {import('https').Agent} HttpsAgent
 */

/**
 * Unary calls are one-to-one operations so this function
 * takes a client message and returns a promise that resolves
 * to the server response.
 *
 * @param {import('@improbable-eng/grpc-web').grpc} grpc - an @improbable-eng/grpc-web instance
 * @param {*} service - an @improbable-eng/grpc-web service
 * @param {any} request - a request object
 * @param {import('../types').RPCOptions<any>} options - RPC options
 * @returns {Promise<any>} - A promise that resolves to a response object
 **/
export function unaryToPromise (grpc, service, request, options) {
  const {
    source, sink
  } = bidiToDuplex(grpc, service, options)

  sink.push(request)

  return first(source)
}
