'use strict'

const errCode = require('err-code')
const multibase = require('multibase')
const { resolvePath } = require('../utils')
const { PinTypes } = require('./pin/pin-manager')

module.exports = ({ pinManager, gcLock, object }) => {
  return async function rm (paths, options) {
    options = options || {}

    const recursive = options.recursive == null ? true : options.recursive

    if (options.cidBase && !multibase.names.includes(options.cidBase)) {
      throw errCode(new Error('invalid multibase'), 'ERR_INVALID_MULTIBASE')
    }

    const cids = await resolvePath(object, paths)
    const release = await gcLock.readLock()
    const results = []

    try {
      // verify that each hash can be unpinned
      for (const cid of cids) {
        const res = await pinManager.isPinnedWithType(cid, PinTypes.all)

        const { pinned, reason } = res
        const key = cid.toBaseEncodedString()

        if (!pinned) {
          throw new Error(`${key} is not pinned`)
        }

        switch (reason) {
          case (PinTypes.recursive):
            if (!recursive) {
              throw new Error(`${key} is pinned recursively`)
            }

            results.push(key)

            break
          case (PinTypes.direct):
            results.push(key)

            break
          default:
            throw new Error(`${key} is pinned indirectly under ${reason}`)
        }
      }

      // update the pin sets in memory
      results.forEach(key => {
        if (recursive && pinManager.recursivePins.has(key)) {
          pinManager.recursivePins.delete(key)
        } else {
          pinManager.directPins.delete(key)
        }
      })

      // persist updated pin sets to datastore
      await pinManager.flushPins()

      return results.map(hash => ({ hash }))
    } finally {
      release()
    }
  }
}
