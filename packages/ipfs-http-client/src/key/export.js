'use strict'

const configure = require('../lib/configure')

module.exports = configure(({ ky }) => {
  return (name, password, options) => {
    if (typeof password !== 'string') {
      options = password
      password = null
    }

    options = options || {}

    const searchParams = new URLSearchParams(options.searchParams)
    searchParams.set('arg', name)
    if (password) searchParams.set('password', password)

    return ky.post('key/export', {
      timeout: options.timeout,
      signal: options.signal,
      headers: options.headers,
      searchParams
    }).text()
  }
})
