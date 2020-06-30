'use strict'

const toCamel = require('./lib/object-to-camel')
const configure = require('./lib/configure')
const toUrlSearchParams = require('./lib/to-url-search-params')

module.exports = configure(api => {
  return async function * ping (peerId, options = {}) {
    const res = await api.post('ping', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: `${peerId}`,
        ...options
      }),
      headers: options.headers,
      transform: toCamel
    })

    yield * res.ndjson()
  }
})
