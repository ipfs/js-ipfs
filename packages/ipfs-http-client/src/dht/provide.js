import { configure } from '../lib/configure.js'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'
import { mapEvent } from './map-event.js'

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

    for await (const event of res.ndjson()) {
      yield mapEvent(event)
    }
  }

  return provide
})
