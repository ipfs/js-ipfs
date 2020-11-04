'use strict'

const CID = require('cids')
const serverStreamToIterator = require('../../utils/server-stream-to-iterator')
const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')

module.exports = function grpcMfsLs (grpc, service, opts = {}) {
  opts = opts || {}

  async function * mfsLs (path, options = {}) {
    const request = {
      path
    }

    for await (const result of serverStreamToIterator(grpc, service, request, {
      host: opts.url,
      debug: Boolean(process.env.DEBUG),
      metadata: options
    })) {
      yield {
        name: result.name,
        type: result.type.toLowerCase(),
        size: result.size,
        cid: new CID(result.cid),
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
