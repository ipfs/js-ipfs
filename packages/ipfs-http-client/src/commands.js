'use strict'

/** @typedef { import("./lib/api") } API */

module.exports = (/** @type {API} */ api) => {
  return async (options = {}) => {
    const res = await api.post('commands', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams: options
    })

    return res.json()
  }
}
