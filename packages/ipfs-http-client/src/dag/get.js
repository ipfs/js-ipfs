'use strict'

const configure = require('../lib/configure')
const resolve = require('../lib/resolve')
const first = require('it-first')
const last = require('it-last')
const errCode = require('err-code')

/**
 * @typedef {import('../types').HTTPClientExtraOptions} HTTPClientExtraOptions
 * @typedef {import('ipfs-core-types/src/dag').API<HTTPClientExtraOptions>} DAGAPI
 */

/**
 * @param {import('ipfs-core-utils/src/multicodecs')} codecs
 * @param {import('../types').Options} options
 */
module.exports = (codecs, options) => {
  const fn = configure((api, opts) => {
    const getBlock = require('../block/get')(opts)

    /**
     * @type {DAGAPI["get"]}
     */
    const get = async (cid, options = {}) => {
      if (options.path) {
        const entry = options.localResolve
          ? await first(resolve(cid, options.path, codecs, getBlock, options))
          : await last(resolve(cid, options.path, codecs, getBlock, options))
        /** @type {import('ipfs-core-types/src/dag').GetResult} - first and last will return undefined when empty */
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
