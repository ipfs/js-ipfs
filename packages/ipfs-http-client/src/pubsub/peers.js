'use strict'

const configure = require('../lib/configure')
const toUrlSearchParams = require('../lib/to-url-search-params')

module.exports = configure(api => {
  return async (topic, options = {}) => {
    if (!options && typeof topic === 'object') {
      options = topic || {}
      topic = null
    }

    const res = await api.post('pubsub/peers', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: topic,
        ...options
      }),
      headers: options.headers
    })

    const { Strings } = await res.json()

    return Strings || []
  }
})
