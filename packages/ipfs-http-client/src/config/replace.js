
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { multipartRequest } from '../lib/multipart-request.js'
import { configure } from '../lib/configure.js'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'
import { abortSignal } from '../lib/abort-signal'
import { AbortController } from 'native-abort-controller'

/**
 * @typedef {import('../types').HTTPClientExtraOptions} HTTPClientExtraOptions
 * @typedef {import('ipfs-core-types/src/config').API<HTTPClientExtraOptions>} ConfigAPI
 */

export const createReplace = configure(api => {
  /**
   * @type {ConfigAPI["replace"]}
   */
  const replace = async (config, options = {}) => {
    // allow aborting requests on body errors
    const controller = new AbortController()
    const signal = abortSignal(controller.signal, options.signal)

    const res = await api.post('config/replace', {
      signal,
      searchParams: toUrlSearchParams(options),
      ...(
        await multipartRequest(uint8ArrayFromString(JSON.stringify(config)), controller, options.headers)
      )
    })

    await res.text()
  }

  return replace
})
