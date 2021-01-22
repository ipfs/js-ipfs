'use strict'

const httpClient = require('ipfs-http-client')
const grpcClient = require('ipfs-grpc-client')
const mergeOptions = require('merge-options')

/**
 * @typedef {import('http').Agent} HttpAgent
 * @typedef {import('https').Agent} HttpsAgent
 *
 * @param {object} opts
 * @param {string} [opts.http] - The address of a running HTTP API as a URL or Multiaddr
 * @param {string} [opts.grpc] - The address of a running gRPC API as a URL or Multiaddr
 * @param {Headers|Record<string, string>} [opts.headers] - Extra headers to be sent with every request
 * @param {number|string} [opts.timeout] - Amount of time until request should timeout in ms or human readable string. https://www.npmjs.com/package/parse-duration for valid string values
 * @param {object} [opts.ipld]
 * @param {any[]} [opts.ipld.formats] - An array of additional [IPLD formats](https://github.com/ipld/interface-ipld-format) to support
 * @param {(format: string) => Promise<any>} [opts.ipld.loadFormat] - an async function that takes the name of an [IPLD format](https://github.com/ipld/interface-ipld-format) as a string and should return the implementation of that codec
 * @param {HttpAgent|HttpsAgent} [opts.agent] - http.Agent used to control HTTP client behaviour (node.js only)
 */
module.exports = function createClient (opts = {}) {
  const clients = []

  if (opts.http) {
    clients.push(httpClient({
      ...opts,
      url: opts.http
    }))
  }

  if (opts.grpc) {
    clients.push(grpcClient({
      url: opts.grpc,
      agent: opts.agent
    }))
  }

  // override http methods with grpc if address is supplied
  return mergeOptions.apply({ ignoreUndefined: true }, clients)
}
