import { withTimeoutOption } from 'ipfs-core-utils/with-timeout-option'
import { toHeaders } from '../utils/to-headers.js'
import { unaryToPromise } from '../utils/unary-to-promise.js'
import { Multiaddr } from 'multiaddr'

/**
 * @param {import('@improbable-eng/grpc-web').grpc} grpc
 * @param {*} service
 * @param {import('../types').Options} opts
 */
export function grpcId (grpc, service, opts) {
  /**
   * @type {import('ipfs-core-types/src/root').API<{}>["id"]}
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
