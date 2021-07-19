'use strict'

const { CID } = require('multiformats/cid')
const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')

/**
 * @param {Object} config
 * @param {import('ipfs-repo').IPFSRepo} config.repo
 * @param {import('ipfs-core-utils/src/multicodecs')} config.codecs
 * @param {import('ipfs-core-utils/src/multihashes')} config.hashers
 * @param {import('../../types').Preload} config.preload
 */
module.exports = ({ repo, codecs, hashers, preload }) => {
  /**
   * @type {import('ipfs-core-types/src/dag').API["put"]}
   */
  async function put (dagNode, options = {}) {
    const release = options.pin ? await repo.gcLock.readLock() : null

    try {
      const codecName = options.format || 'dag-cbor'
      const cidVersion = options.version != null ? options.version : (codecName === 'dag-pb' ? 0 : 1)
      const codec = await codecs.getCodec(codecName)

      if (!codec) {
        throw new Error(`Unknown codec ${options.format}, please configure additional BlockCodecs for this IPFS instance`)
      }

      const hasher = await hashers.getHasher(options.hashAlg || 'sha2-256')

      if (!hasher) {
        throw new Error(`Unknown hash algorithm ${options.hashAlg}, please configure additional MultihashHashers for this IPFS instance`)
      }

      const buf = codec.encode(dagNode)
      const hash = await hasher.digest(buf)
      const cid = CID.create(cidVersion, codec.code, hash)

      await repo.blocks.put(cid, buf, {
        signal: options.signal
      })

      if (options.pin) {
        await repo.pins.pinRecursively(cid)
      }

      if (options.preload !== false) {
        preload(cid)
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
