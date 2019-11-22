'use strict'

const configure = require('../lib/configure')

module.exports = configure(({ ky }) => {
  return async (key, options) => {
    if (key && typeof key === 'object') {
      options = key
      key = null
    }

    options = options || {}

    const searchParams = new URLSearchParams(options.searchParams)
    if (key) searchParams.set('arg', key)

    const url = key ? 'config' : 'config/show'
    const data = await ky.post(url, {
      timeout: options.timeout,
      signal: options.signal,
      headers: options.headers,
      searchParams
    }).json()

    return key ? data.Value : data
  }
})
