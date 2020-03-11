'use strict'

const configure = require('../lib/configure')

module.exports = configure(api => {
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
})
