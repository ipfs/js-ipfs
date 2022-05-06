import { objectToCamel } from './lib/object-to-camel.js'
import { Multiaddr } from '@multiformats/multiaddr'
import { configure } from './lib/configure.js'
import { toUrlSearchParams } from './lib/to-url-search-params.js'
import { peerIdFromString } from '@libp2p/peer-id'

/**
 * @typedef {import('./types').HTTPClientExtraOptions} HTTPClientExtraOptions
 * @typedef {import('ipfs-core-types/src/root').API<HTTPClientExtraOptions>} RootAPI
 */

export const createId = configure(api => {
  /**
   * @type {RootAPI["id"]}
   */
  async function id (options = {}) {
    const res = await api.post('id', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: options.peerId ? options.peerId.toString() : undefined,
        ...options
      }),
      headers: options.headers
    })
    const data = await res.json()

    const output = {
      ...objectToCamel(data)
    }

    output.id = peerIdFromString(output.id)

    if (output.addresses) {
      output.addresses = output.addresses.map((/** @type {string} */ ma) => new Multiaddr(ma))
    }

    // @ts-expect-error server output is not typed
    return output
  }
  return id
})
