'use strict'

const httpClient = require('ipfs-http-client')
const grpcClient = require('ipfs-grpc-client')
const mergeOptions = require('merge-options')

module.exports = function createClient (opts = {}) {
  opts = opts || {}

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
