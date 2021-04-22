'use strict'

const normaliseInput = require('ipfs-core-utils/src/pins/normalise-input')
const { resolvePath } = require('../../utils')
const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')
const { PinTypes } = require('./pin-manager')

/**
 * @param {import('.').Context} context
 * @param {import('ipfs-core-types/src/pin').PinSource} source - Unpin all pins from the source
 * @param {import('ipfs-core-types/src/pin').RmOptions} [options]
 * @returns {AsyncIterable<import('cids')>}
 */
async function * rmAll ({ pinManager, gcLock, ipld }, source, options={}) {
  const release = await gcLock.readLock()

  try {
    // verify that each hash can be unpinned
    for await (const { path, recursive: pinRecursive } of normaliseInput(source)) {
      const recursive = pinRecursive || options.recursive 
      const cid = await resolvePath(ipld, path)
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

module.exports = withTimeoutOption(rmAll)
