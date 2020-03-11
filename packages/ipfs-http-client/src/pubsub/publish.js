'use strict'

const { Buffer } = require('buffer')
const encodeBuffer = require('../lib/encode-buffer-uri-component')

/** @typedef { import("./../lib/api") } API */

module.exports = (/** @type {API} */ api) => {
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
}
