'use strict'

const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')
const toHeaders = require('../utils/to-headers')
const unaryToPromise = require('../utils/unary-to-promise')
const { Multiaddr } = require('multiaddr')

/**
 * @param {import('@improbable-eng/grpc-web').grpc} grpc
 * @param {*} service
 * @param {import('../types').Options} opts
 */
module.exports = function grpcId (grpc, service, opts) {
  /**
   * @type {import('ipfs-core-types/src/root').API["id"]}
   */
  async function id (options = {}) {
    const request = {}

    const res = await unaryToPromise(grpc, service, request, {
      host: opts.url,
      metadata: toHeaders(options),
      agent: opts.agent
    })

    return {
      ...res,
      addresses: (res.addresses || []).map((/** @type {string} */ str) => new Multiaddr(str))
    }
  }

  return withTimeoutOption(id)
}
