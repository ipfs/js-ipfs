'use strict'

const configure = require('../lib/configure')

module.exports = configure(({ ky }) => {
  return async (path, options) => {
    options = options || {}

    const searchParams = new URLSearchParams(options.searchParams)
    searchParams.set('arg', path)
    if (options.dhtRecordCount != null) searchParams.set('dht-record-count', options.dhtRecordCount)
    if (options.dhtTimeout != null) searchParams.set('dht-timeout', options.dhtTimeout)
    if (options.noCache != null) searchParams.set('nocache', options.noCache)
    if (options.recursive != null) searchParams.set('recursive', options.recursive)

    const res = await ky.post('name/resolve', {
      timeout: options.timeout,
      signal: options.signal,
      headers: options.headers,
      searchParams
    }).json()

    return res.Path
  }
})
