'use strict'

/** @typedef { import("./../lib/api") } API */

module.exports = (/** @type {API} */ api) => {
  return async (options = {}) => {
    const res = await (await api.post('repo/version', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams: options
    })).json()

    return res.Version
  }
}
