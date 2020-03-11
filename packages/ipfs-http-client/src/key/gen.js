'use strict'

const toCamel = require('../lib/object-to-camel')

/** @typedef { import("./../lib/api") } API */

module.exports = (/** @type {API} */ api) => {
  return async (name, options = {}) => {
    options.arg = name
    const res = await api.post('key/gen', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams: options
    })
    const data = await res.json()

    return toCamel(data)
  }
}
