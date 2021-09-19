

const modeToString = require('../lib/mode-to-string')
const parseMtime = require('../lib/parse-mtime')
import { configure } from '../lib/configure.js'
import { multipartRequest } from '../lib/multipart-request.js'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'
import { abortSignal } from '../lib/abort-signal'
import { AbortController } from 'native-abort-controller'

/**
 * @typedef {import('../types').HTTPClientExtraOptions} HTTPClientExtraOptions
 * @typedef {import('ipfs-core-types/src/files').API<HTTPClientExtraOptions>} FilesAPI
 */

 export const createWrite = configure(api => {
  /**
   * @type {FilesAPI["write"]}
   */
  async function write (path, input, options = {}) {
    // allow aborting requests on body errors
    const controller = new AbortController()
    const signal = abortSignal(controller.signal, options.signal)

    const res = await api.post('files/write', {
      signal,
      searchParams: toUrlSearchParams({
        arg: path,
        streamChannels: true,
        count: options.length,
        ...options
      }),
      ...(
        await multipartRequest({
          content: input,
          path: 'arg',
          mode: modeToString(options.mode),
          mtime: parseMtime(options.mtime)
        }, controller, options.headers)
      )
    })

    await res.text()
  }
  return write
})
