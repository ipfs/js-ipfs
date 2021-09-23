
import { Multiaddr } from 'multiaddr'
import { objectToCamel } from '../lib/object-to-camel.js'
import { configure } from '../lib/configure.js'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'

/**
 * @typedef {import('../types').HTTPClientExtraOptions} HTTPClientExtraOptions
 * @typedef {import('ipfs-core-types/src/dht').API<HTTPClientExtraOptions>} DHTAPI
 * @typedef {import('multiformats/cid').CID} CID
 */

export const createProvide = configure(api => {
  /**
   * @type {DHTAPI["provide"]}
   */
  async function * provide (cids, options = { recursive: false }) {
    /** @type {CID[]} */
    const cidArr = Array.isArray(cids) ? cids : [cids]

    const res = await api.post('dht/provide', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: cidArr.map(cid => cid.toString()),
        ...options
      }),
      headers: options.headers
    })

    for await (let message of res.ndjson()) {
      message = objectToCamel(message)
      if (message.responses) {
        message.responses = message.responses.map((/** @type {{ ID: string, Addrs: string[] }} */ { ID, Addrs }) => ({
          id: ID,
          addrs: (Addrs || []).map((/** @type {string} **/ a) => new Multiaddr(a))
        }))
      } else {
        message.responses = []
      }
      yield message
    }
  }

  return provide
})
