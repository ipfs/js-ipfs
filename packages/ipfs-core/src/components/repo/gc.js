import { logger } from '@libp2p/logger'
import { withTimeoutOption } from 'ipfs-core-utils/with-timeout-option'
import { loadMfsRoot } from '../files/utils/with-mfs-root.js'

const log = logger('ipfs:repo:gc')

/**
 * @typedef {import('ipfs-core-types/src/pin').API} PinAPI
 * @typedef {import('ipfs-core-types/src/refs').API} RefsAPI
 * @typedef {import('ipfs-repo').IPFSRepo} IPFSRepo
 * @typedef {import('interface-datastore').Key} Key
 * @typedef {import('multiformats/hashes/interface').MultihashHasher} MultihashHasher
 * @typedef {import('ipfs-core-utils/multihashes').Multihashes} Multihashes
 */

/**
 * Perform mark and sweep garbage collection
 *
 * @param {object} config
 * @param {IPFSRepo} config.repo
 * @param {Multihashes} config.hashers
 */
export function createGc ({ repo, hashers }) {
  /**
   * @type {import('ipfs-core-types/src/repo').API<{}>["gc"]}
   */
  async function * gc (options = {}) {
    const start = Date.now()
    let mfsRootCid

    try {
      mfsRootCid = await loadMfsRoot({
        repo,
        hashers
      }, options)

      // temporarily pin mfs root
      await repo.pins.pinRecursively(mfsRootCid)

      yield * repo.gc()
    } finally {
      // gc complete, unpin mfs root
      if (mfsRootCid) {
        await repo.pins.unpin(mfsRootCid)
      }
    }

    log(`Complete (${Date.now() - start}ms)`)
  }

  return withTimeoutOption(gc)
}
