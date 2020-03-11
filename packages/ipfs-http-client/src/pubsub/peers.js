'use strict'

/** @typedef { import("./../lib/api") } API */

module.exports = (/** @type {API} */ api) => {
  return async (topic, options = {}) => {
    if (!options && typeof topic === 'object') {
      options = topic || {}
      topic = null
    }

    const searchParams = new URLSearchParams(options)
    searchParams.set('arg', topic)

    const { Strings } = await (await api.post('pubsub/peers', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams
    })).json()

    return Strings || []
  }
}
