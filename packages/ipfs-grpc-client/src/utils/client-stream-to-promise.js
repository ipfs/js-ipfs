'use strict'

const first = require('it-first')
const bidiToDuplex = require('./bidi-to-duplex')

/**
 * @typedef {import('http').Agent} HttpAgent
 * @typedef {import('https').Agent} HttpsAgent
 */

/**
 * Client streaming methods are a many-to-one operation so this
 * function takes a source that can emit multiple messages and
 * returns a promise that resolves to the server response.
 *
 * @param {object} grpc - an @improbable-eng/grpc-web instance
 * @param {object} service - an @improbable-eng/grpc-web service
 * @param {AsyncIterable<object>} source - a source of objects to send
 * @param {object} options - RPC options
 * @param {string} options.host - The remote host
 * @param {boolean} [options.debug] - Whether to print debug messages
 * @param {object} [options.metadata] - Metadata sent as headers
 * @param {HttpAgent|HttpsAgent} [options.agent] - http.Agent used to control HTTP client behaviour (node.js only)
 * @returns {Promise<Object>} - A promise that resolves to a response object
 **/
module.exports = async function clientStreamToPromise (grpc, service, source, options) {
  const {
    source: serverSource, sink
  } = bidiToDuplex(grpc, service, options)

  for await (const obj of source) {
    sink.push(obj)
  }

  sink.end()

  return first(serverSource)
}
