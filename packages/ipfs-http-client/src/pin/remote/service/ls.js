import { toUrlSearchParams } from '../../../lib/to-url-search-params.js'
import { decodeRemoteService } from './utils.js'

/**
 * @typedef {import('../../../types').HTTPClientExtraOptions} HTTPClientExtraOptions
 * @typedef {import('ipfs-core-types/src/pin/remote/service').API<HTTPClientExtraOptions>} RemotePiningServiceAPI
 */

/**
 * @param {import('../../../lib/core').Client} client
 */
export function createLs (client) {
  /**
   * @type {RemotePiningServiceAPI["ls"]}
   */
  async function ls (options = {}) {
    // @ts-expect-error cannot derive option type from typedef
    const { stat, headers, timeout, signal } = options

    const response = await client.post('pin/remote/service/ls', {
      timeout,
      signal,
      headers,
      searchParams: stat === true ? toUrlSearchParams({ stat }) : undefined
    })

    /** @type {{RemoteServices: object[]}} */
    const { RemoteServices } = await response.json()

    return RemoteServices.map(decodeRemoteService)
  }

  return ls
}
