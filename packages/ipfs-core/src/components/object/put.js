'use strict'

const dagPb = require('@ipld/dag-pb')
const { CID } = require('multiformats/cid')
const { sha256 } = require('multiformats/hashes/sha2')
const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')

/**
 * @param {Object} config
 * @param {import('ipfs-repo').IPFSRepo} config.repo
 * @param {import('../../types').Preload} config.preload
 */
module.exports = ({ repo, preload }) => {
  /**
   * @type {import('ipfs-core-types/src/object').API["put"]}
   */
  async function put (obj, options = {}) {
    const release = await repo.gcLock.readLock()

    try {
      const buf = dagPb.encode(obj)
      const hash = await sha256.digest(buf)
      const cid = CID.createV0(hash)

      await repo.blocks.put(cid, buf, {
        signal: options.signal
      })

      if (options.preload !== false) {
        preload(cid)
      }

      if (options.pin) {
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
