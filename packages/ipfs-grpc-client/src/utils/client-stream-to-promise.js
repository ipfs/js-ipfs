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
 * @param {import('@improbable-eng/grpc-web').grpc} grpc - an @improbable-eng/grpc-web instance
 * @param {*} service - an @improbable-eng/grpc-web service
 * @param {AsyncIterable<any>} source - a source of objects to send
 * @param {import('../types').RPCOptions<any>} options
 * @returns {Promise<any>} - A promise that resolves to a response object
 */
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
