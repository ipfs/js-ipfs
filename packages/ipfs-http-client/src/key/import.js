'use strict'

const toCamel = require('../lib/object-to-camel')
const configure = require('../lib/configure')
const toUrlSearchParams = require('../lib/to-url-search-params')

module.exports = configure(api => {
  return async (name, pem, password, options = {}) => {
    if (typeof password !== 'string') {
      options = password || {}
      password = null
    }

    const res = await api.post('key/import', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: name,
        pem,
        password,
        ...options
      }),
      headers: options.headers
    })
    const data = await res.json()

    return toCamel(data)
  }
})
