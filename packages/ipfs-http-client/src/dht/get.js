
import { configure } from '../lib/configure.js'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'
import { Value } from './response-types.js'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'

/**
 * @typedef {import('../types').HTTPClientExtraOptions} HTTPClientExtraOptions
 * @typedef {import('ipfs-core-types/src/dht').API<HTTPClientExtraOptions>} DHTAPI
 */

export const createGet = configure(api => {
  /**
   * @type {DHTAPI["get"]}
   */
  async function get (key, options = {}) {
    const res = await api.post('dht/get', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: key instanceof Uint8Array ? uint8ArrayToString(key) : key,
        ...options
      }),
      headers: options.headers
    })

    for await (const message of res.ndjson()) {
      if (message.Type === Value) {
        return uint8ArrayFromString(message.Extra, 'base64pad')
      }
    }

    throw new Error('not found')
  }

  return get
})
