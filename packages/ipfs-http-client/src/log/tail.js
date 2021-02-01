'use strict'

const configure = require('../lib/configure')
const toUrlSearchParams = require('../lib/to-url-search-params')

module.exports = configure(api => {
  return async function * tail (options = {}) {
    const res = await api.post('log/tail', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams: toUrlSearchParams(options),
      headers: options.headers,
      // Enables text streaming support for React Native when using https://github.com/react-native-community/fetch
      reactNative: {
        textStreaming: true
      }
    })

    yield * res.ndjson()
  }
})
