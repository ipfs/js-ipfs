'use strict'

const configure = require('../lib/configure')

module.exports = configure(({ ky }) => {
  return (path, options) => {
    options = options || {}

    const searchParams = new URLSearchParams(options.searchParams)
    searchParams.append('arg', path)
    if (options.cidVersion != null) searchParams.set('cid-version', options.cidVersion)
    if (options.format) searchParams.set('format', options.format)
    if (options.flush != null) searchParams.set('flush', options.flush)
    if (options.hashAlg) searchParams.set('hash', options.hashAlg)
    if (options.parents != null) searchParams.set('parents', options.parents)

    return ky.post('files/mkdir', {
      timeout: options.timeout,
      signal: options.signal,
      headers: options.headers,
      searchParams
    }).text()
  }
})
