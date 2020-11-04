'use strict'

const clientStreamToPromise = require('../../utils/client-stream-to-promise')
const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')
const normaliseInput = require('ipfs-core-utils/src/files/normalise-input')
const { mtimeToObject, modeToNumber } = require('ipfs-core-utils/src/files/normalise-input/utils')

module.exports = function grpcMfsWrite (grpc, service, opts = {}) {
  opts = opts || {}

  async function mfsWrite (path, content, options = {}) {
    const stream = async function * () {
      for await (const { content: bufs } of normaliseInput(content)) {
        if (!bufs) {
          return
        }

        for await (const content of bufs) {
          yield { path, content }
        }
      }
    }

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

    await clientStreamToPromise(grpc, service, stream(), {
      host: opts.url,
      debug: Boolean(process.env.DEBUG),
      metadata: options
    })
  }

  return withTimeoutOption(mfsWrite)
}
