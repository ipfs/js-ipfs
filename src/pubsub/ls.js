'use strict'

const configure = require('../lib/configure')

module.exports = configure(({ ky }) => {
  return async (options) => {
    options = options || {}

    const { Strings } = await ky.get('pubsub/ls', {
      timeout: options.timeout,
      signal: options.signal,
      headers: options.headers,
      searchParams: options.searchParams
    }).json()

    return Strings || []
  }
})
