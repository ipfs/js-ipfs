'use strict'

const CID = require('cids')
const multiaddr = require('multiaddr')
const toCamel = require('../lib/object-to-camel')
const configure = require('../lib/configure')
const toUrlSearchParams = require('../lib/to-url-search-params')

module.exports = configure(api => {
  /**
   * @type {import('..').ImplementsMethod<'provide', import('ipfs-core/src/components/dht')>}
   */
  async function * provide (cids, options = {}) {
    cids = Array.isArray(cids) ? cids : [cids]

    const res = await api.post('dht/provide', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: cids.map(cid => new CID(cid).toString()),
        ...options
      }),
      headers: options.headers
    })

    for await (let message of res.ndjson()) {
      message = toCamel(message)
      message.id = new CID(message.id)
      if (message.responses) {
        message.responses = message.responses.map(({ ID, Addrs }) => ({
          id: ID,
          addrs: (Addrs || []).map(a => multiaddr(a))
        }))
      } else {
        message.responses = []
      }
      yield message
    }
  }

  return provide
})
