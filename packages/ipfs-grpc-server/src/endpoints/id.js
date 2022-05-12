import { callbackify } from 'util'
import { peerIdFromString } from '@libp2p/peer-id'

/**
 * @param {import('ipfs-core-types').IPFS} ipfs
 * @param {import('../types').Options} options
 */
export function grpcId (ipfs, options = {}) {
  /**
   * TODO: Fill out input/output types after https://github.com/ipfs/js-ipfs/issues/3594
   *
   * @type {import('../types').UnaryEndpoint<any, any, any>}
   */
  function id (request, metadata) {
    const opts = {
      ...request,
      ...metadata
    }

    return ipfs.id({
      ...opts,
      peerId: opts.peerId ? peerIdFromString(opts.peerId) : undefined
    })
  }

  return callbackify(id)
}
