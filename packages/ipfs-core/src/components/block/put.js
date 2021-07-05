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
    const release = options.pin ? await repo.gcLock.readLock() : null

    try {
      const cidVersion = options.version != null ? options.version : 0
      const codecName = options.format || (cidVersion === 0 ? 'dag-pb' : 'raw')

      const hasher = await hashers.getHasher(options.mhtype || 'sha2-256')
      const hash = await hasher.digest(block)
      const codec = await codecs.getCodec(codecName)
      const cid = CID.create(cidVersion, codec.code, hash)

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
      if (release) {
        release()
      }
    }
  }

  return withTimeoutOption(put)
}
