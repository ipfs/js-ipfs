'use strict'

const configure = require('../lib/configure')
const toUrlSearchParams = require('../lib/to-url-search-params')

module.exports = configure(api => {
  return async (options = {}) => {
    const res = await api.post('bootstrap/add', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams: toUrlSearchParams({
        ...options,
        default: true
      }),
      headers: options.headers
    })

    return res.json()
  }
})
