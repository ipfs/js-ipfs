'use strict'

const CID = require('cids')
const multiaddr = require('multiaddr')
const toCamel = require('../lib/object-to-camel')
const configure = require('../lib/configure')
const toUrlSearchParams = require('../lib/to-url-search-params')
const multipartRequest = require('../lib/multipart-request')

module.exports = configure(api => {
  return async function * put (key, value, options = {}) {
    const res = await api.post('dht/put', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: key,
        ...options
      }),
      ...(
        await multipartRequest(value, options.headers)
      )
    })

    for await (let message of res.ndjson()) {
      message = toCamel(message)
      message.id = new CID(message.id)
      if (message.responses) {
        message.responses = message.responses.map(({ ID, Addrs }) => ({
          id: ID,
          addrs: (Addrs || []).map(a => multiaddr(a))
        }))
      }
      yield message
    }
  }
})
