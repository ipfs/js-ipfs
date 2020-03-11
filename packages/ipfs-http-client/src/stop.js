'use strict'

/** @typedef { import("./lib/api") } API */

module.exports = (/** @type {API} */ api) => {
  return async (options = {}) => {
    return (await api.post('shutdown', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams: options
    })).text()
  }
}
