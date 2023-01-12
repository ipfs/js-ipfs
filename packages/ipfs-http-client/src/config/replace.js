import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { multipartRequest } from 'ipfs-core-utils/multipart-request'
import { configure } from '../lib/configure.js'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'

/**
 * @typedef {import('../types').HTTPClientExtraOptions} HTTPClientExtraOptions
 * @typedef {import('ipfs-core-types/src/config').API<HTTPClientExtraOptions>} ConfigAPI
 */

export const createReplace = configure(api => {
  /**
   * @type {ConfigAPI["replace"]}
   */
  const replace = async (config, options = {}) => {
    const res = await api.post('config/replace', {
      searchParams: toUrlSearchParams(options),
      ...(
        await multipartRequest([uint8ArrayFromString(JSON.stringify(config))], options.headers)
      )
    })

    await res.text()
  }

  return replace
})
