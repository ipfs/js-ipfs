'use strict'

const configure = require('../lib/configure')
const toUrlSearchParams = require('../lib/to-url-search-params')
const multipartRequest = require('../lib/multipart-request')
const abortSignal = require('../lib/abort-signal')
const { AbortController } = require('native-abort-controller')

module.exports = configure(api => {
  return async (topic, data, options = {}) => {
    const searchParams = toUrlSearchParams({
      arg: topic,
      ...options
    })

    // allow aborting requests on body errors
    const controller = new AbortController()
    const signal = abortSignal(controller.signal, options.signal)

    // @ts-ignore https://github.com/ipfs/js-ipfs-utils/issues/90
    const res = await api.post('pubsub/pub', {
      timeout: options.timeout,
      signal,
      searchParams,
      ...(
        await multipartRequest(data, controller, options.headers)
      )
    })

    await res.text()
  }
})
