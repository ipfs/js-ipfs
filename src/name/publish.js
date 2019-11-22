'use strict'

const configure = require('../lib/configure')
const toCamel = require('../lib/object-to-camel')

module.exports = configure(({ ky }) => {
  return async (path, options) => {
    options = options || {}

    const searchParams = new URLSearchParams(options.searchParams)
    searchParams.set('arg', path)
    if (options.allowOffline != null) searchParams.set('allow-offline', options.allowOffline)
    if (options.key) searchParams.set('key', options.key)
    if (options.lifetime) searchParams.set('lifetime', options.lifetime)
    if (options.quieter != null) searchParams.set('quieter', options.quieter)
    if (options.resolve != null) searchParams.set('resolve', options.resolve)
    if (options.ttl) searchParams.set('ttl', options.ttl)

    const res = await ky.post('name/publish', {
      timeout: options.timeout,
      signal: options.signal,
      headers: options.headers,
      searchParams
    }).json()

    return toCamel(res)
  }
})
