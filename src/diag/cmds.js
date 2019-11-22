'use strict'

const configure = require('../lib/configure')

module.exports = configure(({ ky }) => {
  return options => {
    options = options || {}

    const searchParams = new URLSearchParams(options.searchParams)
    if (options.verbose != null) searchParams.set('verbose', options.verbose)

    return ky.post('diag/cmds', {
      timeout: options.timeout,
      signal: options.signal,
      headers: options.headers,
      searchParams
    }).json()
  }
})
