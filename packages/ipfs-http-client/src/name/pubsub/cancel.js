'use strict'

const toCamel = require('../../lib/object-to-camel')

/** @typedef { import("./../../lib/api") } API */

module.exports = (/** @type {API} */ api) => {
  return async (name, options = {}) => {
    const searchParams = new URLSearchParams(options)
    searchParams.set('arg', name)

    const res = await api.post('name/pubsub/cancel', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams
    })

    return toCamel(await res.json())
  }
}
