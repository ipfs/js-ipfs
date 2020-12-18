'use strict'

const encodeMtime = require('../../utils/encode-mtime')

module.exports = function grpcMfsLs (ipfs, options = {}) {
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
