'use strict'

const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')
const first = require('it-first')
const last = require('it-last')
const { resolve } = require('../../utils')
const errCode = require('err-code')

/**
 * @param {Object} config
 * @param {import('ipfs-core-utils/src/multicodecs')} config.codecs
 * @param {import('ipfs-repo').IPFSRepo} config.repo
 * @param {import('../../types').Preload} config.preload
 */
module.exports = ({ codecs, repo, preload }) => {
  /**
   * @type {import('ipfs-core-types/src/dag').API["get"]}
   */
  const get = async function get (cid, options = {}) {
    if (options.preload !== false) {
      preload(cid)
    }

    if (options.path) {
      const entry = options.localResolve
        ? await first(resolve(cid, options.path, codecs, repo, options))
        : await last(resolve(cid, options.path, codecs, repo, options))
      /** @type {import('ipfs-core-types/src/dag').GetResult} - first and last will return undefined when empty */
      const result = (entry)

      if (!result) {
        throw errCode(new Error('Not found'), 'ERR_NOT_FOUND')
      }

      return result
    }

    const codec = await codecs.getCodec(cid.code)
    const block = await repo.blocks.get(cid, options)
    const node = codec.decode(block)

    return {
      value: node,
      remainderPath: ''
    }
  }

  return withTimeoutOption(get)
}
