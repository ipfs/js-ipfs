'use strict'

const CID = require('cids')
const { Multiaddr } = require('multiaddr')
const toCamel = require('../lib/object-to-camel')
const configure = require('../lib/configure')
const toUrlSearchParams = require('../lib/to-url-search-params')

/**
 * @typedef {import('../types').HTTPClientExtraOptions} HTTPClientExtraOptions
 * @typedef {import('ipfs-core-types/src/dht').API<HTTPClientExtraOptions>} DHTAPI
 */

module.exports = configure(api => {
  /**
   * @type {DHTAPI["query"]}
   */
  async function * query (peerId, options = {}) {
    const res = await api.post('dht/query', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: new CID(`${peerId}`),
        ...options
      }),
      headers: options.headers
    })

    for await (let message of res.ndjson()) {
      message = toCamel(message)
      message.id = new CID(message.id)
      message.responses = (message.responses || []).map((/** @type {{ ID: string, Addrs: string[] }} */ { ID, Addrs }) => ({
        id: ID,
        addrs: (Addrs || []).map((/** @type {string} **/ a) => new Multiaddr(a))
      }))
      yield message
    }
  }

  return query
})
