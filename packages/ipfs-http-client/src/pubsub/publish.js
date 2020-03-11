'use strict'

const { Buffer } = require('buffer')
const encodeBuffer = require('../lib/encode-buffer-uri-component')
const configure = require('../lib/configure')

module.exports = configure(api => {
  return async (topic, data, options = {}) => {
    data = Buffer.from(data)

    const searchParams = new URLSearchParams(options)
    searchParams.set('arg', topic)

    const res = await (await api.post(`pubsub/pub?${searchParams}&arg=${encodeBuffer(data)}`, {
      timeout: options.timeout,
      signal: options.signal
    })).text()

    return res
  }
})
