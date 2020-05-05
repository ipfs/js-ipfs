'use strict'

const { Buffer } = require('buffer')
const encodeBuffer = require('../lib/encode-buffer-uri-component')
const configure = require('../lib/configure')
const toUrlSearchParams = require('../lib/to-url-search-params')

module.exports = configure(api => {
  return async (topic, data, options = {}) => {
    data = Buffer.from(data)

    const searchParams = toUrlSearchParams({
      arg: [
        topic
      ],
      ...options
    })

    const res = await api.post(`pubsub/pub?${searchParams}&arg=${encodeBuffer(data)}`, {
      timeout: options.timeout,
      signal: options.signal,
      headers: options.headers
    })

    await res.text()
  }
})
