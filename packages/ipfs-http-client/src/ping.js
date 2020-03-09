'use strict'

const ndjson = require('iterable-ndjson')
const configure = require('./lib/configure')
const toAsyncIterable = require('./lib/stream-to-async-iterable')
const toCamel = require('./lib/object-to-camel')

module.exports = configure(({ ky }) => {
  return async function * ping (peerId, options) {
    options = options || {}

    const searchParams = new URLSearchParams(options.searchParams)
    searchParams.set('arg', `${peerId}`)
    if (options.count != null) searchParams.set('count', options.count)

    const res = await ky.post('ping', {
      timeout: options.timeout,
      signal: options.signal,
      headers: options.headers,
      searchParams
    })

    for await (const chunk of ndjson(toAsyncIterable(res))) {
      yield toCamel(chunk)
    }
  }
})
