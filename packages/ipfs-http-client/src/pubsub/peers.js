'use strict'

const configure = require('../lib/configure')

module.exports = configure(({ ky }) => {
  return async (topic, options) => {
    if (!options && typeof topic === 'object') {
      options = topic
      topic = null
    }

    options = options || {}

    const searchParams = new URLSearchParams(options.searchParams)
    searchParams.set('arg', topic)

    const { Strings } = await ky.post('pubsub/peers', {
      timeout: options.timeout,
      signal: options.signal,
      headers: options.headers,
      searchParams
    }).json()

    return Strings || []
  }
})
