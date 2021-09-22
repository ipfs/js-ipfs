import { toUrlSearchParams } from '../../../lib/to-url-search-params.js'
import { encodeEndpoint } from './utils.js'

/**
 * @typedef {import('../../../types').HTTPClientExtraOptions} HTTPClientExtraOptions
 * @typedef {import('ipfs-core-types/src/pin/remote/service').API<HTTPClientExtraOptions>} RemotePiningServiceAPI
 */

/**
 * @param {import('../../../lib/core').Client} client
 */
export function createAdd (client) {
  /**
   * @type {RemotePiningServiceAPI["add"]}
   */
  async function add (name, options) {
    const { endpoint, key, headers, timeout, signal } = options

    await client.post('pin/remote/service/add', {
      timeout,
      signal,
      searchParams: toUrlSearchParams({
        arg: [name, encodeEndpoint(endpoint), key]
      }),
      headers
    })
  }

  return add
}
