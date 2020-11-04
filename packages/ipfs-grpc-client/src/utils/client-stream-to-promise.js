'use strict'

const first = require('it-first')
const bidiToDuplex = require('./bidi-to-duplex')

/**
 * @param {object} grpc - an @improbable-eng/grpc-web instance
 * @param {object} service - an @improbable-eng/grpc-web service
 * @param {AsyncIterable<object>} source - a source of objects to send
 * @param {object} options - RPC options
 * @param {string} options.host - The remote host
 * @param {boolean} [options.debug] - Whether to print debug messages
 * @param {object} [options.metadata] - Metadata sent as headers
 * @returns {Promise<Object>} - A promise that resolves to a response object
 **/
module.exports = async function clientStreamToPromise (grpc, service, source, options) {
  const {
    source: serverSource, sink
  } = bidiToDuplex(grpc, service, options)

  for await (const obj of source) {
    serverSource.push(obj)
  }

  serverSource.end()

  return first(sink)
}
