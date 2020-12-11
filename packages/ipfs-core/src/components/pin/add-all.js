/* eslint max-nested-callbacks: ["error", 8] */
'use strict'

const { resolvePath } = require('../../utils')
const PinManager = require('./pin-manager')
const { PinTypes } = PinManager
const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')

/** @type {(source:Source) => AsyncIterable<PinTarget>} */
const normaliseInput = require('ipfs-core-utils/src/pins/normalise-input')

/**
 * @param {Object} config
 * @param {import('.').GCLock} config.gcLock
 * @param {import('.').DagReader} config.dagReader
 * @param {import('.').PinManager} config.pinManager
 */
module.exports = ({ pinManager, gcLock, dagReader }) => {
  /**
   * Adds multiple IPFS objects to the pinset and also stores it to the IPFS
   * repo. pinset is the set of hashes currently pinned (not gc'able)
   *
   * @param {Source} source - One or more CIDs or IPFS Paths to pin in your repo
   * @param {AddOptions} [options]
   * @returns {AsyncIterable<CID>} - CIDs that were pinned.
   * @example
   * ```js
   * const cid = CID.from('QmWATWQ7fVPP2EFGu71UkfnqhYXDYH566qy47CnJDgvs8u')
   * for await (const cid of ipfs.pin.addAll([cid])) {
   *   console.log(cid)
   * }
   * // Logs:
   * // CID('QmWATWQ7fVPP2EFGu71UkfnqhYXDYH566qy47CnJDgvs8u')
   * ```
   */
  async function * addAll (source, options = {}) {
    /**
     * @returns {AsyncIterable<CID>}
     */
    const pinAdd = async function * () {
      for await (const { path, recursive, metadata } of normaliseInput(source)) {
        const cid = await resolvePath(dagReader, path)

        // verify that each hash can be pinned
        const { reason } = await pinManager.isPinnedWithType(cid, [PinTypes.recursive, PinTypes.direct])

        if (reason === 'recursive' && !recursive) {
          // only disallow trying to override recursive pins
          throw new Error(`${cid} already pinned recursively`)
        }

        if (recursive) {
          await pinManager.pinRecursively(cid, { metadata })
        } else {
          await pinManager.pinDirectly(cid, { metadata })
        }

        yield cid
      }
    }

    // When adding a file, we take a lock that gets released after pinning
    // is complete, so don't take a second lock here
    const lock = Boolean(options.lock)

    if (!lock) {
      yield * pinAdd()
      return
    }

    const release = await gcLock.readLock()

    try {
      yield * pinAdd()
    } finally {
      release()
    }
  }

  return withTimeoutOption(addAll)
}

/**
 * @typedef {import('ipfs-core-utils/src/pins/normalise-input').Source} Source
 * @typedef {import('ipfs-core-utils/src/pins/normalise-input').Pin} PinTarget
 *
 * @typedef {AddSettings & AbortOptions} AddOptions
 *
 * @typedef {Object} AddSettings
 * @property {boolean} [lock]
 *
 * @typedef {import('.').AbortOptions} AbortOptions
 *
 * @typedef {import('.').CID} CID
 */

/**
 * @template T
 * @typedef {Iterable<T>|AsyncIterable<T>} AwaitIterable
 */
