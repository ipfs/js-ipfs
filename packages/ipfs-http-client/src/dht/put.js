
import { Multiaddr } from 'multiaddr'
import { objectToCamel } from '../lib/object-to-camel'
import { configure } from '../lib/configure.js'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'
import { multipartRequest } from '../lib/multipart-request.js'
import { abortSignal } from '../lib/abort-signal'
import { AbortController } from 'native-abort-controller'
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'

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
        arg: uint8ArrayToString(key),
        ...options
      }),
      ...(
        await multipartRequest(value, controller, options.headers)
      )
    })

    for await (let message of res.ndjson()) {
      message = toCamel(message)
      if (message.responses) {
        message.responses = message.responses.map((/** @type {{ ID: string, Addrs: string[] }} */ { ID, Addrs }) => ({
          id: ID,
          addrs: (Addrs || []).map(a => new Multiaddr(a))
        }))
      }
      yield message
    }
  }

  return put
})
