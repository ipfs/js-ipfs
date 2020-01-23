'use strict'

const errCode = require('err-code')
const multibase = require('multibase')
const { parallelMap, collect } = require('streaming-iterables')
const pipe = require('it-pipe')
const { resolvePath } = require('../../utils')
const { PinTypes } = require('./pin-manager')

const PIN_RM_CONCURRENCY = 8

module.exports = ({ pinManager, gcLock, dag }) => {
  return async function rm (paths, options) {
    options = options || {}

    const recursive = options.recursive !== false

    if (options.cidBase && !multibase.names.includes(options.cidBase)) {
      throw errCode(new Error('invalid multibase'), 'ERR_INVALID_MULTIBASE')
    }

    const cids = await resolvePath(dag, paths)
    const release = await gcLock.readLock()

    try {
      // verify that each hash can be unpinned
      const results = await pipe(
        cids,
        parallelMap(PIN_RM_CONCURRENCY, async cid => {
          const { pinned, reason } = await pinManager.isPinnedWithType(cid, PinTypes.all)

          if (!pinned) {
            throw new Error(`${cid} is not pinned`)
          }
          if (reason !== PinTypes.recursive && reason !== PinTypes.direct) {
            throw new Error(`${cid} is pinned indirectly under ${reason}`)
          }
          if (reason === PinTypes.recursive && !recursive) {
            throw new Error(`${cid} is pinned recursively`)
          }

          return cid
        }),
        collect
      )

      // update the pin sets in memory
      results.forEach(cid => {
        if (recursive && pinManager.recursivePins.has(cid.toString())) {
          pinManager.recursivePins.delete(cid.toString())
        } else {
          pinManager.directPins.delete(cid.toString())
        }
      })

      // persist updated pin sets to datastore
      await pinManager.flushPins()

      return results.map(cid => ({ cid }))
    } finally {
      release()
    }
  }
}
