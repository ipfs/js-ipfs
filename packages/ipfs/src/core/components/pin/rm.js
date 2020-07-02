'use strict'

const normaliseInput = require('ipfs-core-utils/src/pins/normalise-input')
const { resolvePath, withTimeoutOption } = require('../../utils')
const { PinTypes } = require('./pin-manager')

module.exports = ({ pinManager, gcLock, dag }) => {
  return withTimeoutOption(async function * rm (paths, options = {}) {
    const release = await gcLock.readLock()

    try {
      // verify that each hash can be unpinned
      for await (const { path, recursive } of normaliseInput(paths)) {
        const cid = await resolvePath(dag, path)
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
  })
}
