import { configure } from '../lib/configure.js'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'
import { multipartRequest } from 'ipfs-core-utils/multipart-request'
import { textToUrlSafeRpc } from '../lib/http-rpc-wire-format.js'
import { abortSignal } from "../lib/abort-signal.js";

/**
 * @typedef {import('../types').HTTPClientExtraOptions} HTTPClientExtraOptions
 * @typedef {import('ipfs-core-types/src/pubsub').API<HTTPClientExtraOptions>} PubsubAPI
 */

export const createPublish = configure(api => {
  /**
   * @type {PubsubAPI["publish"]}
   */
  async function publish (topic, data, options = {}) {
    const searchParams = toUrlSearchParams({
      arg: textToUrlSafeRpc(topic),
      ...options
    })

    const res = await api.post('pubsub/pub', {
      signal: abortSignal(options.signal),
      searchParams,
      ...(
        await multipartRequest([data], options.headers)
      )
    })

    await res.text()
  }
  return publish
})
