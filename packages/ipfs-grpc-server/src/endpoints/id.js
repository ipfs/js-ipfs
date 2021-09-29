import { callbackify } from 'util'

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

    return ipfs.id(opts)
  }

  return callbackify(id)
}
