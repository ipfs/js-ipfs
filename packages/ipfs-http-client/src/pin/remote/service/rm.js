import { toUrlSearchParams } from '../../../lib/to-url-search-params.js'

/**
 * @typedef {import('../../../types').HTTPClientExtraOptions} HTTPClientExtraOptions
 * @typedef {import('ipfs-core-types/src/pin/remote/service').API<HTTPClientExtraOptions>} RemotePiningServiceAPI
 */

/**
 * @param {import('../../../lib/core').Client} client
 */
export function createRm (client) {
  /**
   * @type {RemotePiningServiceAPI["rm"]}
   */
  async function rm (name, options = {}) {
    await client.post('pin/remote/service/rm', {
      signal: options.signal,
      headers: options.headers,
      searchParams: toUrlSearchParams({
        arg: name
      })
    })
  }

  return rm
}
