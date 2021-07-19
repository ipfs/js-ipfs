'use strict'

const configure = require('../lib/configure')

/**
 * @typedef {import('../types').HTTPClientExtraOptions} HTTPClientExtraOptions
 * @typedef {import('ipfs-core-types/src/object').API<HTTPClientExtraOptions>} ObjectAPI
 */

/**
 * @param {import('ipfs-core-utils/src/multicodecs')} codecs
 * @param {import('../types').Options} options
 */
module.exports = (codecs, options) => {
  const fn = configure((api) => {
    const dagPut = require('../dag/put')(codecs, options)

    /**
     * @type {ObjectAPI["put"]}
     */
    async function put (obj, options = {}) {
      return dagPut(obj, {
        ...options,
        format: 'dag-pb',
        hashAlg: 'sha2-256',
        version: 0
      })
    }
    return put
  })

  return fn(options)
}
