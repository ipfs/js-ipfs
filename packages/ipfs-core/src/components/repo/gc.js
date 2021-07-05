'use strict'

const log = require('debug')('ipfs:repo:gc')
const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')
const loadMfsRoot = require('../files/utils/with-mfs-root')

/**
 * @typedef {import('ipfs-core-types/src/pin').API} PinAPI
 * @typedef {import('ipfs-core-types/src/refs').API} RefsAPI
 * @typedef {import('ipfs-repo').IPFSRepo} IPFSRepo
 * @typedef {import('interface-datastore').Key} Key
 * @typedef {import('multiformats/hashes/interface').MultihashHasher} MultihashHasher
 * @typedef {import('ipfs-core-utils/src/multihashes')} Multihashes
 */

/**
 * Perform mark and sweep garbage collection
 *
 * @param {Object} config
 * @param {IPFSRepo} config.repo
 * @param {Multihashes} config.hashers
 */
module.exports = ({ repo, hashers }) => {
  /**
   * @type {import('ipfs-core-types/src/repo').API["gc"]}
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
