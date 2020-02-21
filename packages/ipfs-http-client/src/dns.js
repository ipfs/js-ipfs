'use strict'

const configure = require('./lib/configure')

module.exports = configure(({ ky }) => {
  return async (domain, options) => {
    options = options || {}

    const searchParams = new URLSearchParams(options.searchParams)
    searchParams.set('arg', domain)
    if (options.recursive != null) searchParams.set('recursive', options.recursive)

    const res = await ky.post('dns', {
      timeout: options.timeout,
      signal: options.signal,
      headers: options.headers,
      searchParams
    }).json()

    return res.Path
  }
})
