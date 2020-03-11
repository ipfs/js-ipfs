'use strict'

const toCamel = require('./lib/object-to-camel')

/** @typedef { import("./lib/api") } API */

module.exports = (/** @type {API} */ api) => {
  return async (options = {}) => {
    const res = await api.post('dns', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams: options
    })

    return toCamel(await res.json())
  }
}
