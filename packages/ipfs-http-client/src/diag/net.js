'use strict'

const configure = require('../lib/configure')

module.exports = configure(({ ky }) => {
  return options => {
    options = options || {}

    return ky.post('diag/net', {
      timeout: options.timeout,
      signal: options.signal,
      headers: options.headers,
      searchParams: options.searchParams
    }).json()
  }
})
