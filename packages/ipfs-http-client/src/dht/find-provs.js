'use strict'

const CID = require('cids')
const { Multiaddr } = require('multiaddr')
const configure = require('../lib/configure')
const toUrlSearchParams = require('../lib/to-url-search-params')
const { Provider } = require('./response-types')

/**
 * @typedef {import('../types').HTTPClientExtraOptions} HTTPClientExtraOptions
 * @typedef {import('ipfs-core-types/src/dht').API<HTTPClientExtraOptions>} DHTAPI
 */

module.exports = configure(api => {
  /**
   * @type {DHTAPI["findProvs"]}
   */
  async function * findProvs (cid, options = {}) {
    const res = await api.post('dht/findprovs', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: `${new CID(cid)}`,
        ...options
      }),
      headers: options.headers
    })

    for await (const message of res.ndjson()) {
      if (message.Type === Provider && message.Responses) {
        for (const { ID, Addrs } of message.Responses) {
          yield {
            id: ID,
            addrs: (Addrs || []).map((/** @type {string} **/ a) => new Multiaddr(a))
          }
        }
      }
    }
  }

  return findProvs
})
