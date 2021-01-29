'use strict'

const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')
const toHeaders = require('../utils/to-headers')
const unaryToPromise = require('../utils/unary-to-promise')
const multiaddr = require('multiaddr')

module.exports = function grpcId (grpc, service, opts = {}) {
  async function id (options = {}) {
    const request = {}

    const res = await unaryToPromise(grpc, service, request, {
      host: opts.url,
      metadata: toHeaders(options),
      agent: opts.agent
    })

    return {
      ...res,
      addresses: (res.addresses || []).map(multiaddr)
    }
  }

  return withTimeoutOption(id)
}
