'use strict'

const { Buffer } = require('buffer')
const toFormData = require('../lib/buffer-to-form-data')

/** @typedef { import("./../lib/api") } API */

module.exports = (/** @type {API} */ api) => {
  return async (config, options = {}) => {
    const res = await api.post('config/replace', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams: options,
      body: toFormData(Buffer.from(JSON.stringify(config)))
    })

    return res.text()
  }
}
