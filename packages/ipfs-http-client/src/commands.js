'use strict'

const configure = require('./lib/configure')

module.exports = configure(({ ky }) => {
  return options => {
    options = options || {}

    const searchParams = new URLSearchParams(options.searchParams)
    if (options.flags != null) searchParams.set('flags', options.flags)

    return ky.post('commands', {
      timeout: options.timeout,
      signal: options.signal,
      headers: options.headers,
      searchParams
    }).json()
  }
})
