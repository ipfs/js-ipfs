'use strict'

/** @typedef { import("./lib/api") } API */

module.exports = (/** @type {API} */ api) => {
  return async (path, options = {}) => {
    options.arg = path
    const rsp = await api.post('resolve', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams: options
    })
    const data = await rsp.json()
    return data.Path
  }
}
