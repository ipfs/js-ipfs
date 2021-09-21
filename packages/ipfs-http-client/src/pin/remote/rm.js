import { encodeQuery } from './utils.js'

/**
 * @typedef {import('../../types').HTTPClientExtraOptions} HTTPClientExtraOptions
 * @typedef {import('ipfs-core-types/src/pin/remote').API<HTTPClientExtraOptions>} RemotePiningAPI
 */

/**
 * @param {import('../../lib/core').Client} client
 */
export function createRm (client) {
  /**
   * @type {RemotePiningAPI["rm"]}
   */
  async function rm ({ timeout, signal, headers, ...query }) {
    await client.post('pin/remote/rm', {
      timeout,
      signal,
      headers,
      searchParams: encodeQuery({
        ...query,
        all: false
      })
    })
  }

  return rm
}
