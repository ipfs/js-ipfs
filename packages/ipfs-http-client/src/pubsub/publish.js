'use strict'

const { Buffer } = require('buffer')
const configure = require('../lib/configure')
const toUrlSearchParams = require('../lib/to-url-search-params')
const multipartRequest = require('../lib/multipart-request')

module.exports = configure(api => {
  return async (topic, data, options = {}) => {
    data = Buffer.from(data)

    const searchParams = toUrlSearchParams({
      arg: topic,
      ...options
    })

    const res = await api.post('pubsub/pub', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams,
      ...(
        await multipartRequest(data, options.headers)
      )
    })

    await res.text()
  }
})
