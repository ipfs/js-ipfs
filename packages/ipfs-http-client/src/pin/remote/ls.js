import { encodeQuery, decodePin } from './utils.js'

/**
 * @typedef {import('../../types').HTTPClientExtraOptions} HTTPClientExtraOptions
 * @typedef {import('ipfs-core-types/src/pin/remote').API<HTTPClientExtraOptions>} RemotePiningAPI
 */

/**
 * @param {import('../../lib/core').Client} client
 */
export function createLs (client) {
  /**
   * @type {RemotePiningAPI["ls"]}
   */
  async function * ls ({ timeout, signal, headers, ...query }) {
    const response = await client.post('pin/remote/ls', {
      timeout,
      signal,
      headers,
      searchParams: encodeQuery(query)
    })

    for await (const pin of response.ndjson()) {
      yield decodePin(pin)
    }
  }

  return ls
}
