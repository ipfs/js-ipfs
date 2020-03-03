'use strict'

const { resolvePath } = require('../../utils')
const { PinTypes } = require('./pin-manager')

module.exports = ({ pinManager, gcLock, dag }) => {
  return async function * rm (paths, options) {
    options = options || {}

    const recursive = options.recursive == null ? true : options.recursive
    const cids = await resolvePath(dag, paths, { signal: options.signal })

    const release = await gcLock.readLock()

    try {
      // verify that each hash can be unpinned
      for (const cid of cids) {
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

            yield {
              cid
            }

            break
          case (PinTypes.direct):
            await pinManager.unpin(cid)

            yield {
              cid
            }

            break
          default:
            throw new Error(`${cid} is pinned indirectly under ${reason}`)
        }
      }
    } finally {
      release()
    }
  }
}
