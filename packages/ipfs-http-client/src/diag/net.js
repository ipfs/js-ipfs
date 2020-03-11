'use strict'

/** @typedef { import("./../lib/api") } API */

module.exports = (/** @type {API} */ api) => {
  return async (options = {}) => {
    const res = await api.post('diag/net', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams: options.searchParams
    })
    return res.json()
  }
}
