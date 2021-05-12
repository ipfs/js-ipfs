'use strict'

const normaliseInput = require('ipfs-core-utils/src/pins/normalise-input')
const { resolvePath } = require('../../utils')
const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')
const { PinTypes } = require('./pin-manager')

/**
 * @param {Object} config
 * @param {import('./pin-manager')} config.pinManager
 * @param {import('.').GCLock} config.gcLock
 * @param {import('ipld')} config.ipld
 */
module.exports = ({ pinManager, gcLock, ipld }) => {
  /**
   * @type {import('ipfs-core-types/src/pin').API["rmAll"]}
   */
  async function * rmAll (source, _options = {}) {
    const release = await gcLock.readLock()

    try {
      // verify that each hash can be unpinned
      for await (const { path, recursive } of normaliseInput(source)) {
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

  return withTimeoutOption(rmAll)
}
