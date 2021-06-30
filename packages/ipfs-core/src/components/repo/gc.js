'use strict'

const log = require('debug')('ipfs:repo:gc')
const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')

/**
 * @typedef {import('ipfs-core-types/src/pin').API} PinAPI
 * @typedef {import('ipfs-core-types/src/refs').API} RefsAPI
 * @typedef {import('ipfs-repo').IPFSRepo} IPFSRepo
 * @typedef {import('interface-datastore').Key} Key
 */

/**
 * Perform mark and sweep garbage collection
 *
 * @param {Object} config
 * @param {IPFSRepo} config.repo
 */
module.exports = ({ repo }) => {
  /**
   * @type {import('ipfs-core-types/src/repo').API["gc"]}
   */
  async function * gc (_options = {}) {
    const start = Date.now()
    log('Creating set of marked blocks')

    const release = await repo.gcLock.writeLock()

    try {
      yield * repo.gc()

      log(`Complete (${Date.now() - start}ms)`)
    } finally {
      release()
    }
  }

  return withTimeoutOption(gc)
}
