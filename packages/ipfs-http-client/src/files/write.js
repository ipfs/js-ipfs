import { modeToString } from '../lib/mode-to-string.js'
import { parseMtime } from '../lib/parse-mtime.js'
import { configure } from '../lib/configure.js'
import { multipartRequest } from 'ipfs-core-utils/multipart-request'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'
import { abortSignal } from '../lib/abort-signal.js'

/**
 * @typedef {import('../types').HTTPClientExtraOptions} HTTPClientExtraOptions
 * @typedef {import('ipfs-core-types/src/files').API<HTTPClientExtraOptions>} FilesAPI
 */

export const createWrite = configure(api => {
  /**
   * @type {FilesAPI["write"]}
   */
  async function write (path, input, options = {}) {
    const res = await api.post('files/write', {
      signal: abortSignal(options.signal),
      searchParams: toUrlSearchParams({
        arg: path,
        streamChannels: true,
        count: options.length,
        ...options
      }),
      ...(
        await multipartRequest([{
          content: input,
          path: 'arg',
          mode: modeToString(options.mode),
          mtime: parseMtime(options.mtime)
        }], options.headers)
      )
    })

    await res.text()
  }
  return write
})
