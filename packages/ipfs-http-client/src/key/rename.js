'use strict'

const toCamel = require('../lib/object-to-camel')

/** @typedef { import("./../lib/api") } API */

module.exports = (/** @type {API} */ api) => {
  return async (oldName, newName, options = {}) => {
    const searchParams = new URLSearchParams(options)
    searchParams.set('arg', oldName)
    searchParams.append('arg', newName)

    const res = await api.post('key/rename', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams
    })

    return toCamel(await res.json())
  }
}
