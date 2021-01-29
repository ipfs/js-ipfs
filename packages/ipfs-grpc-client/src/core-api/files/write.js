'use strict'

const clientStreamToPromise = require('../../utils/client-stream-to-promise')
const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')
const normaliseInput = require('ipfs-core-utils/src/files/normalise-input')
const { mtimeToObject, modeToNumber } = require('ipfs-core-utils/src/files/normalise-input/utils')

async function * stream (path, content) {
  for await (const { content: bufs } of normaliseInput(content)) {
    if (!bufs) {
      return
    }

    for await (const content of bufs) {
      yield { path, content }
    }
  }
}

module.exports = function grpcMfsWrite (grpc, service, opts = {}) {
  async function mfsWrite (path, content, options = {}) {
    const mtime = mtimeToObject(options.mtime)

    if (mtime != null) {
      options = {
        ...options,
        mtime: mtime.secs,
        mtimeNsecs: mtime.nsecs
      }
    }

    const mode = modeToNumber(options.mode)

    if (mode != null) {
      options.mode = mode
    }

    await clientStreamToPromise(grpc, service, stream(path, content), {
      host: opts.url,
      debug: Boolean(process.env.DEBUG),
      metadata: options,
      agent: opts.agent
    })
  }

  return withTimeoutOption(mfsWrite)
}
