'use strict'

const configure = require('./lib/configure')
const toUrlSearchParams = require('./lib/to-url-search-params')

module.exports = configure(api => {
  return async (options = {}) => {
    const res = await api.post('shutdown', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams: toUrlSearchParams(options),
      headers: options.headers
    })

    await res.text()
  }
})
