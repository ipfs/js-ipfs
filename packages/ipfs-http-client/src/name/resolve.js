'use strict'

const ndjson = require('iterable-ndjson')
const configure = require('../lib/configure')
const toIterable = require('stream-to-it/source')

module.exports = configure(({ ky }) => {
  return async function * (path, options) {
    options = options || {}

    const searchParams = new URLSearchParams(options.searchParams)
    searchParams.set('arg', path)
    searchParams.set('stream', options.stream == null ? true : options.stream)
    if (options.dhtRecordCount != null) searchParams.set('dht-record-count', options.dhtRecordCount)
    if (options.dhtTimeout != null) searchParams.set('dht-timeout', options.dhtTimeout)
    if (options.noCache != null) searchParams.set('nocache', options.noCache)
    if (options.recursive != null) searchParams.set('recursive', options.recursive)

    const res = await ky.post('name/resolve', {
      timeout: options.timeout,
      signal: options.signal,
      headers: options.headers,
      searchParams
    })

    for await (const result of ndjson(toIterable(res.body))) {
      yield result.Path
    }
  }
})
