/* eslint max-nested-callbacks: ["error", 8] */
'use strict'

const { resolvePath, withTimeoutOption } = require('../../utils')

module.exports = ({ pinManager, gcLock, dag }) => {
  return withTimeoutOption(async function add (paths, options) {
    options = options || {}

    const recursive = options.recursive !== false
    const cids = await resolvePath(dag, paths, { signal: options.signal })
    const pinAdd = async () => {
      const results = []

      // verify that each hash can be pinned
      for (const cid of cids) {
        const key = cid.toBaseEncodedString()

        if (recursive) {
          if (pinManager.recursivePins.has(key)) {
            // it's already pinned recursively
            results.push(cid)

            continue
          }

          // entire graph of nested links should be pinned,
          // so make sure we have all the objects
          await pinManager.fetchCompleteDag(key, { preload: options.preload, signal: options.signal })

          // found all objects, we can add the pin
          results.push(cid)
        } else {
          if (pinManager.recursivePins.has(key)) {
            // recursive supersedes direct, can't have both
            throw new Error(`${key} already pinned recursively`)
          }

          if (!pinManager.directPins.has(key)) {
            // make sure we have the object
            await dag.get(cid, { preload: options.preload })
          }

          results.push(cid)
        }
      }

      // update the pin sets in memory
      const pinset = recursive ? pinManager.recursivePins : pinManager.directPins
      results.forEach(cid => pinset.add(cid.toString()))

      // persist updated pin sets to datastore
      await pinManager.flushPins()

      return results.map(cid => ({ cid }))
    }

    // When adding a file, we take a lock that gets released after pinning
    // is complete, so don't take a second lock here
    const lock = Boolean(options.lock)

    if (!lock) {
      return pinAdd()
    }

    const release = await gcLock.readLock()

    try {
      await pinAdd()
    } finally {
      release()
    }
  })
}
