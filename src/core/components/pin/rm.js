'use strict'

const errCode = require('err-code')
const multibase = require('multibase')
const { parallelMap, collect } = require('streaming-iterables')
const pipe = require('it-pipe')
const { resolvePath } = require('../utils')
const { PinTypes } = require('./pin/pin-manager')

const PIN_RM_CONCURRENCY = 8

module.exports = ({ pinManager, gcLock, object }) => {
  return async function rm (paths, options) {
    options = options || {}

    const recursive = options.recursive !== false

    if (options.cidBase && !multibase.names.includes(options.cidBase)) {
      throw errCode(new Error('invalid multibase'), 'ERR_INVALID_MULTIBASE')
    }

    const cids = await resolvePath(object, paths)
    const release = await gcLock.readLock()

    try {
      // verify that each hash can be unpinned
      const results = await pipe(
        cids,
        parallelMap(PIN_RM_CONCURRENCY, async cid => {
          const res = await pinManager.isPinnedWithType(cid, PinTypes.all)

          const { pinned, reason } = res
          const key = cid.toBaseEncodedString()

          if (!pinned) {
            throw new Error(`${key} is not pinned`)
          }
          if (reason !== PinTypes.recursive && reason !== PinTypes.direct) {
            throw new Error(`${key} is pinned indirectly under ${reason}`)
          }
          if (reason === PinTypes.recursive && !recursive) {
            throw new Error(`${key} is pinned recursively`)
          }

          return key
        }),
        collect
      )

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

      return results
    } finally {
      release()
    }
  }
}
