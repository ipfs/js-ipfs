/* eslint max-nested-callbacks: ["error", 8] */
'use strict'

const { resolvePath, withTimeoutOption } = require('../../utils')
const PinManager = require('./pin-manager')
const { PinTypes } = PinManager
const normaliseInput = require('ipfs-core-utils/src/pins/normalise-input')

module.exports = ({ pinManager, gcLock, dag }) => {
  return withTimeoutOption(async function * addAll (source, options) {
    options = options || {}

    const pinAdd = async function * () {
      for await (const { path, recursive, metadata } of normaliseInput(source)) {
        const cid = await resolvePath(dag, path)

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
  })
}
