'use strict'

const toCamel = require('../lib/object-to-camel')

/** @typedef { import("./../lib/api") } API */

module.exports = (/** @type {API} */ api) => {
  return async (name, options = {}) => {
    const searchParams = new URLSearchParams(options)
    searchParams.set('arg', name)

    const res = await api.post('key/rm', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams
    })
    const data = await res.json()

    return toCamel(data.Keys[0])
  }
}
