import { CID } from 'multiformats/cid'
import { withTimeoutOption } from 'ipfs-core-utils/with-timeout-option'

/**
 * @typedef {import('multiformats/cid').Version} CIDVersion
 */

/**
 * @param {object} config
 * @param {import('ipfs-core-utils/multicodecs').Multicodecs} config.codecs
 * @param {import('ipfs-core-utils/multihashes').Multihashes} config.hashers
 * @param {import('ipfs-repo').IPFSRepo} config.repo
 * @param {import('../../types').Preload} config.preload
 *
 */
export function createPut ({ codecs, hashers, repo, preload }) {
  /**
   * @type {import('ipfs-core-types/src/block').API<{}>["put"]}
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
