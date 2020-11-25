'use strict'

const CID = require('cids')
const errCode = require('err-code')
const { parallelMap, filter } = require('streaming-iterables')
const { pipe } = require('it-pipe')
const { PinTypes } = require('../pin/pin-manager')
const { cleanCid } = require('./utils')
const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')

const BLOCK_RM_CONCURRENCY = 8

/**
 * @param {Object} config
 * @param {import('.').BlockService} config.blockService
 * @param {import('.').PinManager} config.pinManager
 * @param {import('.').GCLock} config.gcLock
 */
module.exports = ({ blockService, gcLock, pinManager }) => {
  /**
  /**
   * Remove one or more IPFS block(s).
   *
   * @param {CID[]|CID} cids - CID(s) corresponding to the block(s) to be removed.
   * @param {RmOptions & AbortOptions} [options]
   * @returns {AsyncIterable<RmResult>}
   *
   * @example
   * ```js
   * for await (const result of ipfs.block.rm(cid)) {
   *   if (result.error) {
   *     console.error(`Failed to remove block ${result.cid} due to ${result.error.message}`)
   *   } else {
   *    console.log(`Removed block ${result.cid}`)
   *   }
   * }
   * ```
   */
  async function * rm (cids, options = {}) {
    if (!Array.isArray(cids)) {
      cids = [cids]
    }

    // We need to take a write lock here to ensure that adding and removing
    // blocks are exclusive operations
    const release = await gcLock.writeLock()

    try {
      yield * pipe(
        cids,
        parallelMap(BLOCK_RM_CONCURRENCY, async cid => {
          cid = cleanCid(cid)

          const result = { cid }

          try {
            const pinResult = await pinManager.isPinnedWithType(cid, PinTypes.all)

            if (pinResult.pinned) {
              if (CID.isCID(pinResult.reason)) { // eslint-disable-line max-depth
                throw errCode(new Error(`pinned via ${pinResult.reason}`))
              }

              throw errCode(new Error(`pinned: ${pinResult.reason}`))
            }

            // remove has check when https://github.com/ipfs/js-ipfs-block-service/pull/88 is merged
            // @ts-ignore - this accesses some internals
            const has = await blockService._repo.blocks.has(cid)

            if (!has) {
              throw errCode(new Error('block not found'), 'ERR_BLOCK_NOT_FOUND')
            }

            await blockService.delete(cid)
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

/**
 * @typedef {Object} RmOptions
 * @property {boolean} [force=false] - Ignores nonexistent blocks
 * @property {boolean} [quiet=false] - Write minimal output
 *
 * @typedef {import('.').AbortOptions} AbortOptions
 *
 * @typedef {RmSucceess|RmFailure} RmResult
 * Note: If an error is present for a given object, the block with
 * that cid was not removed and the error will contain the reason why,
 * for example if the block was pinned.
 *
 * @typedef {Object} RmSucceess
 * @property {CID} cid
 * @property {void} [error]
 *
 * @typedef {Object} RmFailure
 * @property {CID} cid
 * @property {Error} error
 */
