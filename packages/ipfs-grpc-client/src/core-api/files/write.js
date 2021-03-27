'use strict'

const clientStreamToPromise = require('../../utils/client-stream-to-promise')
const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')
const normaliseContent = require('ipfs-core-utils/src/files/normalise-input/normalise-content')
const {
  parseMtime,
  parseMode
} = require('ipfs-unixfs')

/**
 * @param {string} path
 * @param {*} content
 */
async function * stream (path, content) {
  for await (const buf of normaliseContent(content)) {
    yield { path, content: buf }
  }
}

/**
 * @param {import('@improbable-eng/grpc-web').grpc} grpc
 * @param {*} service
 * @param {import('../../types').Options} opts
 */
module.exports = function grpcMfsWrite (grpc, service, opts) {
  /**
   * @type {import('ipfs-core-types/src/files').API["write"]}
   */
  async function mfsWrite (path, content, options = {}) {
    /**
     * TODO: fix after https://github.com/ipfs/js-ipfs/issues/3594
     *
     * @type {Record<string, any>}
     */
    const metadata = {
      ...options
    }
    const mtime = parseMtime(options.mtime)

    if (mtime != null) {
      metadata.mtime = mtime.secs
      metadata.mtimeNsecs = mtime.nsecs
    }

    const mode = parseMode(options.mode)

    if (mode != null) {
      metadata.mode = mode
    }

    await clientStreamToPromise(grpc, service, stream(path, content), {
      host: opts.url,
      debug: Boolean(process.env.DEBUG),
      metadata,
      agent: opts.agent
    })
  }

  return withTimeoutOption(mfsWrite)
}
