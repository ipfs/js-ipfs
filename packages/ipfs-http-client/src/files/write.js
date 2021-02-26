'use strict'

const modeToString = require('../lib/mode-to-string')
const { mtimeToObject } = require('ipfs-core-utils/src/files/normalise-input/utils')
const configure = require('../lib/configure')
const multipartRequest = require('../lib/multipart-request')
const toUrlSearchParams = require('../lib/to-url-search-params')
const abortSignal = require('../lib/abort-signal')
const { AbortController } = require('native-abort-controller')

module.exports = configure(api => {
  /**
   * @type {import('..').Implements<typeof import('ipfs-core/src/components/files/write')>}
   */
  async function write (path, input, options = {}) {
    // allow aborting requests on body errors
    const controller = new AbortController()
    const signal = abortSignal(controller.signal, options.signal)

    // @ts-ignore https://github.com/ipfs/js-ipfs-utils/issues/90
    const res = await api.post('files/write', {
      timeout: options.timeout,
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
          mtime: mtimeToObject(options.mtime)
        }, controller, options.headers)
      )
    })

    await res.text()
  }

  return write
})
