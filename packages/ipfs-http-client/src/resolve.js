'use strict'

const configure = require('./lib/configure')

module.exports = configure(({ ky }) => {
  return async (path, options) => {
    options = options || {}

    const searchParams = new URLSearchParams(options.searchParams)
    searchParams.set('arg', `${path}`)
    if (options.cidBase) searchParams.set('cid-base', options.cidBase)
    if (options.dhtRecordCount) searchParams.set('dht-record-count', options.dhtRecordCount)
    if (options.dhtTimeout) searchParams.set('dht-timeout', options.dhtTimeout)
    if (options.recursive != null) searchParams.set('recursive', options.recursive)

    const res = await ky.post('resolve', {
      timeout: options.timeout,
      signal: options.signal,
      headers: options.headers,
      searchParams
    }).json()

    return res.Path
  }
})
