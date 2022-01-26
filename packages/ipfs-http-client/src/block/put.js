import { CID } from 'multiformats/cid'
import { multipartRequest } from 'ipfs-core-utils/multipart-request'
import { configure } from '../lib/configure.js'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'
import { abortSignal } from '../lib/abort-signal.js'

/**
 * @typedef {import('../types').HTTPClientExtraOptions} HTTPClientExtraOptions
 * @typedef {import('ipfs-core-types/src/block').API<HTTPClientExtraOptions>} BlockAPI
 */

export const createPut = configure(api => {
  /**
   * @type {BlockAPI["put"]}
   */
  async function put (data, options = {}) {
    // allow aborting requests on body errors
    const controller = new AbortController()
    const signal = abortSignal(controller.signal, options.signal)

    let res
    try {
      const response = await api.post('block/put', {
        signal: signal,
        searchParams: toUrlSearchParams(options),
        ...(
          await multipartRequest([data], controller, options.headers)
        )
      })
      res = await response.json()
    } catch (/** @type {any} */ err) {
      // Retry with "protobuf"/"cbor" format for go-ipfs
      // TODO: remove when https://github.com/ipfs/go-cid/issues/75 resolved
      if (options.format === 'dag-pb') {
        return put(data, { ...options, format: 'protobuf' })
      } else if (options.format === 'dag-cbor') {
        return put(data, { ...options, format: 'cbor' })
      }

      throw err
    }

    return CID.parse(res.Key)
  }

  return put
})
