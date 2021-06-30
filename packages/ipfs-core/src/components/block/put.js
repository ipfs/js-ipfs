'use strict'

const { CID } = require('multiformats/cid')
const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')

/**
 * @typedef {import('multiformats/cid').CIDVersion} CIDVersion
 */

/**
 * @param {Object} config
 * @param {import('ipfs-core-utils/src/multicodecs')} config.codecs
 * @param {import('ipfs-core-utils/src/multihashes')} config.hashers
 * @param {import('ipfs-repo').IPFSRepo} config.repo
 * @param {import('../../types').Preload} config.preload
 *
 */
module.exports = ({ codecs, hashers, repo, preload }) => {
  /**
   * @type {import('ipfs-core-types/src/block').API["put"]}
   */
  async function put (block, options = {}) {
    if (Array.isArray(block)) {
      throw new Error('Array is not supported')
    }

    const release = await repo.gcLock.readLock()

    try {
      const hasher = await hashers.getHasher(options.mhtype || 'sha2-256')
      const hash = await hasher.digest(block)
      const codec = await codecs.getCodec(options.format)
      const cid = CID.create(options.version, codec.code, hash)

      await repo.blocks.put(cid, block, {
        signal: options.signal
      })

      if (options.preload !== false) {
        preload(cid)
      }

      if (options.pin === true) {
        await repo.pins.pinRecursively(cid, {
          signal: options.signal
        })
      }

      return cid
    } finally {
      release()
    }
  }

  return withTimeoutOption(put)
}
