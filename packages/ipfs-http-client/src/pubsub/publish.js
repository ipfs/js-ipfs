import { configure } from '../lib/configure.js'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'
import { multipartRequest } from 'ipfs-core-utils/multipart-request'
import { abortSignal } from '../lib/abort-signal.js'
import { textToUrlSafeRpc } from '../lib/http-rpc-wire-format.js'

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

    // allow aborting requests on body errors
    const controller = new AbortController()
    const signal = abortSignal(controller.signal, options.signal)

    const res = await api.post('pubsub/pub', {
      signal,
      searchParams,
      ...(
        await multipartRequest([data], controller, options.headers)
      )
    })

    await res.text()
  }
  return publish
})
