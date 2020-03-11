'use strict'

/** @typedef { import("./../../lib/api") } API */

module.exports = (/** @type {API} */ api) => {
  return async (options = {}) => {
    const res = await api.post('name/pubsub/subs', {
      timeout: options.timeout,
      signal: options.signal
    })
    const data = await res.json()

    return data.Strings || []
  }
}
