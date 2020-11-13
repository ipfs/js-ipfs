'use strict'

const uint8ArrayFromString = require('uint8arrays/from-string')
const multipartRequest = require('../lib/multipart-request')
const configure = require('../lib/configure')
const toUrlSearchParams = require('../lib/to-url-search-params')
const { anySignal } = require('any-signal')
const AbortController = require('native-abort-controller')

module.exports = configure(api => {
  /**
   * @type {import('..').ImplementsMethod<'replace', import('ipfs-core/src/components/config')>}
   */
  const replace = async (config, options = {}) => {
    // allow aborting requests on body errors
    const controller = new AbortController()
    const signal = anySignal([controller.signal, options.signal])

    const res = await api.post('config/replace', {
      timeout: options.timeout,
      signal,
      searchParams: toUrlSearchParams(options),
      ...(
        await multipartRequest(uint8ArrayFromString(JSON.stringify(config)), controller, options.headers)
      )
    })

    return res.text()
  }

  return replace
})
