'use strict'

const errCode = require('err-code')
const { parallelMap, filter } = require('streaming-iterables')
const { pipe } = require('it-pipe')
const { cleanCid } = require('./utils')
const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')

const BLOCK_RM_CONCURRENCY = 8

/**
 * @param {Object} config
 * @param {import('ipfs-repo').IPFSRepo} config.repo
 */
module.exports = ({ repo }) => {
  /**
   * @type {import('ipfs-core-types/src/block').API["rm"]}
   */
  async function * rm (cids, options = {}) {
    if (!Array.isArray(cids)) {
      cids = [cids]
    }

    // We need to take a write lock here to ensure that adding and removing
    // blocks are exclusive operations
    const release = await repo.gcLock.writeLock()

    try {
      yield * pipe(
        cids,
        parallelMap(BLOCK_RM_CONCURRENCY, async cid => {
          cid = cleanCid(cid)

          /** @type {import('ipfs-core-types/src/block').RmResult} */
          const result = { cid }

          try {
            const has = await repo.blocks.has(cid)

            if (!has) {
              throw errCode(new Error('block not found'), 'ERR_BLOCK_NOT_FOUND')
            }

            await repo.blocks.delete(cid)
          } catch (err) {
            if (!options.force) {
              err.message = `cannot remove ${cid}: ${err.message}`
              result.error = err
            }
          }

          return result
        }),
        filter(() => !options.quiet)
      )
    } finally {
      release()
    }
  }

  return withTimeoutOption(rm)
}
