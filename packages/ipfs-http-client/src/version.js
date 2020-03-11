'use strict'

const toCamel = require('./lib/object-to-camel')

/** @typedef { import("./lib/api") } API */

/**
 * Version
 * @param {API} api
 * @returns {function(Object): Promise<Object>}
 */
const version = (api) => {
  return async (options = {}) => {
    const res = await (await api.post('version', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams: options.searchParams
    })).json()

    return toCamel(res)
  }
}

module.exports = version
