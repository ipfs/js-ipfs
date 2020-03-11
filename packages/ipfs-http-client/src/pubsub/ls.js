'use strict'

const configure = require('../lib/configure')

module.exports = configure(api => {
  return async (options = {}) => {
    const { Strings } = await (await api.post('pubsub/ls', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams: options.searchParams
    })).json()

    return Strings || []
  }
})
