'use strict'

/** @typedef { import("./../../lib/api") } API */

module.exports = (/** @type {API} */ api) => {
  return async (profile, options = {}) => {
    options.arg = profile
    const response = await api.post('config/profile/apply', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams: options
    })
    const res = await response.json()

    return {
      original: res.OldCfg, updated: res.NewCfg
    }
  }
}
