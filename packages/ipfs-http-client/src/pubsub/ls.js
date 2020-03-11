'use strict'

/** @typedef { import("./../lib/api") } API */

module.exports = (/** @type {API} */ api) => {
  return async (options = {}) => {
    const { Strings } = await (await api.post('pubsub/ls', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams: options.searchParams
    })).json()

    return Strings || []
  }
}
