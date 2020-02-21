'use strict'

const { Buffer } = require('buffer')
const configure = require('../lib/configure')
const encodeBuffer = require('../lib/encode-buffer-uri-component')

module.exports = configure(({ ky }) => {
  return async (topic, data, options) => {
    options = options || {}
    data = Buffer.from(data)

    const searchParams = new URLSearchParams(options.searchParams)
    searchParams.set('arg', topic)

    const res = await ky.post(`pubsub/pub?${searchParams}&arg=${encodeBuffer(data)}`, {
      timeout: options.timeout,
      signal: options.signal,
      headers: options.headers
    }).text()

    return res
  }
})
