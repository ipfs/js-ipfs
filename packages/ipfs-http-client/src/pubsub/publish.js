'use strict'

const configure = require('../lib/configure')
const toUrlSearchParams = require('../lib/to-url-search-params')
const multipartRequest = require('../lib/multipart-request')
const abortSignal = require('../lib/abort-signal')
const { AbortController } = require('native-abort-controller')

/**
 * @typedef {import('../types').HTTPClientExtraOptions} HTTPClientExtraOptions
 * @typedef {import('ipfs-core-types/src/pubsub').API<HTTPClientExtraOptions>} PubsubAPI
 */

module.exports = configure(api => {
  /**
   * @type {PubsubAPI["publish"]}
   */
  async function publish (topic, data, options = {}) {
    const searchParams = toUrlSearchParams({
      arg: topic,
      ...options
    })

    // allow aborting requests on body errors
    const controller = new AbortController()
    const signal = abortSignal(controller.signal, options.signal)

    const res = await api.post('pubsub/pub', {
      signal,
      searchParams,
      ...(
        await multipartRequest(data, controller, options.headers)
      )
    })

    await res.text()
  }
  return publish
})
