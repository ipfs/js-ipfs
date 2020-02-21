'use strict'

const { Buffer } = require('buffer')
const configure = require('../lib/configure')
const toFormData = require('../lib/buffer-to-form-data')

module.exports = configure(({ ky }) => {
  return async (config, options) => {
    options = options || {}

    const res = await ky.post('config/replace', {
      timeout: options.timeout,
      signal: options.signal,
      headers: options.headers,
      searchParams: options.searchParams,
      body: toFormData(Buffer.from(JSON.stringify(config)))
    }).text()

    return res
  }
})
