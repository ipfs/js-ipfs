'use strict'

const toCamel = require('../../lib/object-to-camel')

/** @typedef { import("./../../lib/api") } API */

module.exports = (/** @type {API} */ api) => {
  return async (options = {}) => {
    const res = await api.post('config/profile/list', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams: options
    })

    const data = await res.json()

    return data.map(profile => toCamel(profile))
  }
}
