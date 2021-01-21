'use strict'

const httpClient = require('ipfs-http-client')
const grpcClient = require('ipfs-grpc-client')
const mergeOptions = require('merge-options')


/**
 * @typedef {import('ipfs-http-client/src/lib/core').ClientOptions} HTTPOptions
 * @typedef {import('ipfs-grpc-client/src/index').Options} GRPCOptions
 * @typedef {Partial<HTTPOptions & GRPCOptions> & {
 *   url?: string
 *   http?: string,
 *   grpc?: string
 * }} Options
 * 
 * @param {Options} [opts]
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
      ...opts,
      url: opts.grpc
    }))
  }

  // override http methods with grpc if address is supplied
  return mergeOptions.apply({ ignoreUndefined: true }, clients)
}
