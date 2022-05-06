import { configure } from '../lib/configure.js'
import { resolve } from '../lib/resolve.js'
import first from 'it-first'
import last from 'it-last'
import errCode from 'err-code'
import { createGet as createBlockGet } from '../block/get.js'

/**
 * @typedef {import('../types').HTTPClientExtraOptions} HTTPClientExtraOptions
 * @typedef {import('ipfs-core-types/src/dag').API<HTTPClientExtraOptions>} DAGAPI
 */

/**
 * @param {import('ipfs-core-utils/multicodecs').Multicodecs} codecs
 * @param {import('../types').Options} options
 */
export const createGet = (codecs, options) => {
  const fn = configure((api, opts) => {
    const getBlock = createBlockGet(opts)

    /**
     * @type {DAGAPI["get"]}
     */
    const get = async (cid, options = {}) => {
      if (options.path) {
        const entry = options.localResolve
          ? await first(resolve(cid, options.path, codecs, getBlock, options))
          : await last(resolve(cid, options.path, codecs, getBlock, options))
        /** @type {import('ipfs-core-types/src/dag').GetResult | undefined} - first and last will return undefined when empty */
        const result = (entry)

        if (!result) {
          throw errCode(new Error('Not found'), 'ERR_NOT_FOUND')
        }

        return result
      }

      const codec = await codecs.getCodec(cid.code)
      const block = await getBlock(cid, options)
      const node = codec.decode(block)

      return {
        value: node,
        remainderPath: ''
      }
    }

    return get
  })

  return fn(options)
}
