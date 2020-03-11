'use strict'

/** @typedef { import("./../lib/api") } API */

module.exports = (/** @type {API} */ api) => {
  return async (path, options = {}) => {
    options.arg = path
    const res = await api.post('files/rm', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams: options
    })

    return res.text()
  }
}
