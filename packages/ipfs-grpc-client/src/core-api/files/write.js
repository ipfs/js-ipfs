import { clientStreamToPromise } from '../../utils/client-stream-to-promise.js'
import { withTimeoutOption } from 'ipfs-core-utils/with-timeout-option'
import { normaliseContent } from 'ipfs-core-utils/files/normalise-content'
import {
  parseMtime,
  parseMode
} from 'ipfs-unixfs'

/**
 * @param {string} path
 * @param {*} content
 */
async function * stream (path, content) {
  for await (const buf of await normaliseContent(content)) {
    yield { path, content: buf }
  }
}

/**
 * @param {import('@improbable-eng/grpc-web').grpc} grpc
 * @param {*} service
 * @param {import('../../types').Options} opts
 */
export function grpcMfsWrite (grpc, service, opts) {
  /**
   * @type {import('ipfs-core-types/src/files').API<{}>["write"]}
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
