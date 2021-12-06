import { configure } from '../lib/configure.js'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'
import { mapEvent } from './map-event.js'

/**
 * @typedef {import('../types').HTTPClientExtraOptions} HTTPClientExtraOptions
 * @typedef {import('ipfs-core-types/src/dht').API<HTTPClientExtraOptions>} DHTAPI
 */

export const createFindPeer = configure(api => {
  /**
   * @type {DHTAPI["findPeer"]}
   */
  async function * findPeer (peerId, options = {}) {
    const res = await api.post('dht/findpeer', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: peerId,
        ...options
      }),
      headers: options.headers
    })

    for await (const event of res.ndjson()) {
      yield mapEvent(event)
    }
  }

  return findPeer
})
