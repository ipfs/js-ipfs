'use strict'

const CID = require('cids')
const errCode = require('err-code')
const { parallelMap, filter } = require('streaming-iterables')
const pipe = require('it-pipe')
const { PinTypes } = require('../pin/pin-manager')
const { cleanCid } = require('./utils')
const { withTimeoutOption } = require('../../utils')

const BLOCK_RM_CONCURRENCY = 8

/**
 * @typedef {import("../pin/pin-manager")} PinManager
 * @typedef {import("ipfs-block-service")} BlockService
 * @typedef {import("../init").GCLock} GCLock
 * @typedef {import("../index").Pin} Pin
 */

/**
 * @typedef {Object} RmConfig
 * @property {BlockService} blockService
 * @property {GCLock} gcLock
 * @property {PinManager} pinManager
 *
 * @param {RmConfig} config
 * @returns {Rm}
 */
module.exports = ({ blockService, gcLock, pinManager }) => {
  /**
   * @typedef {Object} Options
   * @property {boolean} [force=false] - Ignores nonexistent blocks
   * @property {boolean} [quiet=false] - Write minimal output
   * @property {number} [timeout] - A timeout in ms
   * @property {AbortSignal} [signal] - Can be used to cancel any long
   * running requests started as a result of this call
   *
   * @typedef {Object} Out
   * @property {CID} cid
   * @property {string} [error]
   *
   * @callback Rm
   * Remove one or more IPFS block(s).
   * @param {CID|CID[]} cids
   * @param {Options} [options]
   * @returns {AsyncIterable<Out>}
   *
   * @type {Rm}
   */
  async function * rm (cids, options) {
    options = options || {}

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

          /** @type {Out} */
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
