'use strict'

const toCamel = require('../lib/object-to-camel')

/** @typedef { import("./../lib/api") } API */

module.exports = (/** @type {API} */ api) => {
  return async (options = {}) => {
    const res = await api.post('key/list', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams: options.searchParams
    })
    const data = await res.json()

    return (data.Keys || []).map(k => toCamel(k))
  }
}
