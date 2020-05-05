'use strict'

const configure = require('../lib/configure')
const toUrlSearchParams = require('../lib/to-url-search-params')

module.exports = configure(api => {
  return async (key, options = {}) => {
    if (key && typeof key === 'object') {
      options = key
      key = null
    }

    const url = key ? 'config' : 'config/show'
    const res = await api.post(url, {
      timeout: options.timeout,
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: key,
        ...options
      }),
      headers: options.headers
    })
    const data = await res.json()

    return key ? data.Value : data
  }
})
