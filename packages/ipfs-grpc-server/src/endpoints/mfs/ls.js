import { encodeMtime } from '../../utils/encode-mtime.js'

/**
 * @param {import('ipfs-core-types').IPFS} ipfs
 * @param {import('../../types').Options} options
 */
export function grpcMfsLs (ipfs, options = {}) {
  /**
   * TODO: Fill out input/output types after https://github.com/ipfs/js-ipfs/issues/3594
   *
   * @type {import('../../types').ServerStreamingEndpoint<any, any, any>}
   */
  async function mfsLs (request, sink, metadata) {
    const opts = {
      ...metadata
    }

    for await (const result of ipfs.files.ls(request.path, opts)) {
      sink.push({
        ...result,
        cid: result.cid.toString(),
        type: result.type.toUpperCase(),
        ...encodeMtime(result.mtime)
      })
    }

    sink.end()
  }

  return mfsLs
}
