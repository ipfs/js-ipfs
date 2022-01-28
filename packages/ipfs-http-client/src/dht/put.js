import { configure } from '../lib/configure.js'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'
import { multipartRequest } from 'ipfs-core-utils/multipart-request'
import { abortSignal } from '../lib/abort-signal.js'
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'
import { mapEvent } from './map-event.js'

/**
 * @typedef {import('../types').HTTPClientExtraOptions} HTTPClientExtraOptions
 * @typedef {import('ipfs-core-types/src/dht').API<HTTPClientExtraOptions>} DHTAPI
 */

export const createPut = configure(api => {
  /**
   * @type {DHTAPI["put"]}
   */
  async function * put (key, value, options = {}) {
    // allow aborting requests on body errors
    const controller = new AbortController()
    const signal = abortSignal(controller.signal, options.signal)

    const res = await api.post('dht/put', {
      signal,
      searchParams: toUrlSearchParams({
        arg: key instanceof Uint8Array ? uint8ArrayToString(key) : key.toString(),
        ...options
      }),
      ...(
        await multipartRequest([value], controller, options.headers)
      )
    })

    for await (const event of res.ndjson()) {
      yield mapEvent(event)
    }
  }

  return put
})
