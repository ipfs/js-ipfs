'use strict'

const normaliseInput = require('ipfs-core-utils/src/pins/normalise-input')
const { resolvePath } = require('../../utils')
const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')
const { PinTypes } = require('./pin-manager')

/**
 * @param {Object} config
 * @param {import('.').PinManager} config.pinManager
 * @param {import('.').GCLock} config.gcLock
 * @param {import('.').DagReader} config.dagReader
 */
module.exports = ({ pinManager, gcLock, dagReader }) => {
  /**
   * Unpin one or more blocks from your repo
   *
   * @param {Source} source - Unpin all pins from the source
   * @param {AbortOptions} [_options]
   * @returns {AsyncIterable<CID>}
   * @example
   * ```js
   * const source = [
   *   CID.from('QmWATWQ7fVPP2EFGu71UkfnqhYXDYH566qy47CnJDgvs8u')
   * ]
   * for await (const cid of ipfs.pin.rmAll(source)) {
   *   console.log(cid)
   * }
   * // prints the CIDs that were unpinned
   * // CID('QmWATWQ7fVPP2EFGu71UkfnqhYXDYH566qy47CnJDgvs8u')
   * ```
   */
  async function * rmAll (source, _options = {}) {
    const release = await gcLock.readLock()

    try {
      // verify that each hash can be unpinned
      for await (const { path, recursive } of normaliseInput(source)) {
        const cid = await resolvePath(dagReader, path)
        const { pinned, reason } = await pinManager.isPinnedWithType(cid, PinTypes.all)

        if (!pinned) {
          throw new Error(`${cid} is not pinned`)
        }

        switch (reason) {
          case (PinTypes.recursive):
            if (!recursive) {
              throw new Error(`${cid} is pinned recursively`)
            }

            await pinManager.unpin(cid)

            yield cid

            break
          case (PinTypes.direct):
            await pinManager.unpin(cid)

            yield cid

            break
          default:
            throw new Error(`${cid} is pinned indirectly under ${reason}`)
        }
      }
    } finally {
      release()
    }
  }

  return withTimeoutOption(rmAll)
}

/**
 * @typedef {import('.').CID} CID
 * @typedef {import('.').AbortOptions} AbortOptions
 * @typedef {import('./add-all').Source} Source
 */
