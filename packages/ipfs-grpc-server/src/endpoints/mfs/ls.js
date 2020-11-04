'use strict'

module.exports = function grpcMfsLs (ipfs, options = {}) {
  async function mfsLs (request, sink, metadata) {
    const opts = {
      ...metadata
    }

    for await (const result of ipfs.files.ls(request.path, opts)) {
      result.cid = result.cid.toString()
      result.type = result.type.toUpperCase()

      if (!result.mtime) {
        delete result.mtime
      } else {
        result.mtime_nsecs = result.mtime.nsecs
        result.mtime = result.mtime.secs
      }

      sink.push(result)
    }

    sink.end()
  }

  return mfsLs
}
