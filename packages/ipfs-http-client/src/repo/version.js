'use strict'

const configure = require('../lib/configure')

module.exports = configure(({ ky }) => {
  return async options => {
    options = options || {}

    const searchParams = new URLSearchParams(options.searchParams)
    if (options.sizeOnly) searchParams.set('size-only', options.sizeOnly)

    const res = await ky.post('repo/version', {
      timeout: options.timeout,
      signal: options.signal,
      headers: options.headers,
      searchParams
    }).json()

    return res.Version
  }
})
