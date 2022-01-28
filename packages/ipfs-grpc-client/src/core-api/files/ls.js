import { CID } from 'multiformats/cid'
import { serverStreamToIterator } from '../../utils/server-stream-to-iterator.js'
import { withTimeoutOption } from 'ipfs-core-utils/with-timeout-option'

/**
 * @param {import('@improbable-eng/grpc-web').grpc} grpc
 * @param {*} service
 * @param {import('../../types').Options} opts
 */
export function grpcMfsLs (grpc, service, opts) {
  /**
   * @type {import('ipfs-core-types/src/files').API<{}>["ls"]}
   */
  async function * mfsLs (path, options = {}) {
    const request = {
      path
    }

    for await (const result of serverStreamToIterator(grpc, service, request, {
      host: opts.url,
      debug: Boolean(process.env.DEBUG),
      metadata: options,
      agent: opts.agent
    })) {
      yield {
        name: result.name,
        type: result.type.toLowerCase(),
        size: result.size,
        cid: CID.parse(result.cid),
        mode: result.mode,
        mtime: {
          secs: result.mtime || 0,
          nsecs: result.mtimeNsecs || 0
        }
      }
    }
  }

  return withTimeoutOption(mfsLs)
}
