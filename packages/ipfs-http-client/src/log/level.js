'use strict'

const toCamel = require('../lib/object-to-camel')
/** @typedef { import("./../lib/api") } API */

module.exports = (/** @type {API} */ api) => {
  return async (subsystem, level, options = {}) => {
    const searchParams = new URLSearchParams(options)
    searchParams.append('arg', subsystem)
    searchParams.append('arg', level)

    const res = await api.post('log/level', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams
    })

    return toCamel(await res.json())
  }
}
