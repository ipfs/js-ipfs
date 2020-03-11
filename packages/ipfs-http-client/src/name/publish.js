'use strict'

const toCamel = require('../lib/object-to-camel')

/** @typedef { import("./../lib/api") } API */

module.exports = (/** @type {API} */ api) => {
  return async (path, options = {}) => {
    const searchParams = new URLSearchParams(options)
    searchParams.set('arg', path)

    const res = await api.post('name/publish', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams
    })

    return toCamel(await res.json())
  }
}
