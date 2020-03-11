'use strict'

/** @typedef { import("./lib/api") } API */

module.exports = (/** @type {API} */ api) => {
  return async (domain, options = {}) => {
    options.arg = domain
    const res = await api.post('dns', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams: options
    })
    const data = await res.json()

    return data.Path
  }
}
