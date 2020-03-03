/* eslint max-nested-callbacks: ["error", 8] */
'use strict'

const { resolvePath, withTimeoutOption } = require('../../utils')
const PinManager = require('./pin-manager')
const { PinTypes } = PinManager

module.exports = ({ pinManager, gcLock, dag }) => {
  return withTimeoutOption(async function * add (paths, options) {
    options = options || {}

    const recursive = options.recursive !== false
    const cids = await resolvePath(dag, paths, { signal: options.signal })
    const pinAdd = async function * () {
      // verify that each hash can be pinned
      for (const cid of cids) {
        const { reason } = await pinManager.isPinnedWithType(cid, [PinTypes.recursive, PinTypes.direct])

        if (reason === 'recursive' && !recursive) {
          // only disallow trying to override recursive pins
          throw new Error(`${cid} already pinned recursively`)
        }

        if (recursive) {
          await pinManager.pinRecursively(cid)
        } else {
          await pinManager.pinDirectly(cid)
        }

        yield { cid }
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
  })
}
