'use strict'

const configure = require('../lib/configure')
const toUrlSearchParams = require('../lib/to-url-search-params')

module.exports = configure(api => {
  return async (name, password, options = {}) => {
    if (typeof password !== 'string') {
      options = password || {}
      password = null
    }

    const res = await api.post('key/export', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: name,
        password: password,
        ...options
      }),
      headers: options.headers
    })

    return res.text()
  }
})
