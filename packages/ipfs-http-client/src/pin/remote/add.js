import { encodeAddParams, decodePin } from './utils.js'

/**
 * @typedef {import('../../types').HTTPClientExtraOptions} HTTPClientExtraOptions
 * @typedef {import('ipfs-core-types/src/pin/remote').API<HTTPClientExtraOptions>} RemotePiningAPI
 */

/**
 * @param {import('../../lib/core').Client} client
 */
export function createAdd (client) {
  /**
   * @type {RemotePiningAPI["add"]}
   */
  async function add (cid, { timeout, signal, headers, ...query }) {
    const response = await client.post('pin/remote/add', {
      timeout,
      signal,
      headers,
      searchParams: encodeAddParams({ cid, ...query })
    })

    return decodePin(await response.json())
  }

  return add
}
