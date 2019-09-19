/* eslint max-nested-callbacks: ["error", 8] */
'use strict'

const callbackify = require('callbackify')
const errCode = require('err-code')
const multibase = require('multibase')
const { resolvePath } = require('../utils')
const PinManager = require('./pin/pin-manager')
const PinTypes = PinManager.PinTypes

module.exports = (self) => {
  const dag = self.dag
  const pinManager = new PinManager(self._repo, dag)

  const pin = {
    add: callbackify.variadic(async (paths, options) => {
      options = options || {}

      const recursive = options.recursive !== false
      const cids = await resolvePath(self.object, paths)
      const pinAdd = async () => {
        const results = []

        // verify that each hash can be pinned
        for (const cid of cids) {
          const key = cid.toBaseEncodedString()

          if (recursive) {
            if (pinManager.recursivePins.has(key)) {
              // it's already pinned recursively
              results.push(key)

              continue
            }

            // entire graph of nested links should be pinned,
            // so make sure we have all the objects
            await pinManager.fetchCompleteDag(key, { preload: options.preload })

            // found all objects, we can add the pin
            results.push(key)
          } else {
            if (pinManager.recursivePins.has(key)) {
              // recursive supersedes direct, can't have both
              throw new Error(`${key} already pinned recursively`)
            }

            if (!pinManager.directPins.has(key)) {
              // make sure we have the object
              await dag.get(cid, { preload: options.preload })
            }

            results.push(key)
          }
        }

        // update the pin sets in memory
        const pinset = recursive ? pinManager.recursivePins : pinManager.directPins
        results.forEach(key => pinset.add(key))

        // persist updated pin sets to datastore
        await pinManager.flushPins()

        return results.map(hash => ({ hash }))
      }

      // When adding a file, we take a lock that gets released after pinning
      // is complete, so don't take a second lock here
      const lock = Boolean(options.lock)

      if (!lock) {
        return pinAdd()
      }

      const release = await self._gcLock.readLock()

      try {
        await pinAdd()
      } finally {
        release()
      }
    }),

    rm: callbackify.variadic(async (paths, options) => {
      options = options || {}

      const recursive = options.recursive == null ? true : options.recursive

      if (options.cidBase && !multibase.names.includes(options.cidBase)) {
        throw errCode(new Error('invalid multibase'), 'ERR_INVALID_MULTIBASE')
      }

      const cids = await resolvePath(self.object, paths)
      const release = await self._gcLock.readLock()
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

        self.log(`Removed pins: ${results}`)

        return results.map(hash => ({ hash }))
      } finally {
        release()
      }
    }),

    ls: callbackify.variadic(async (paths, options) => {
      options = options || {}

      let type = PinTypes.all

      if (paths && paths.type) {
        options = paths
        paths = null
      }

      if (options.type) {
        type = options.type
        if (typeof options.type === 'string') {
          type = options.type.toLowerCase()
        }
        const err = PinManager.checkPinType(type)
        if (err) {
          throw err
        }
      }

      if (paths) {
        // check the pinned state of specific hashes
        const cids = await resolvePath(self.object, paths)
        const results = []

        for (const cid of cids) {
          const { key, reason, pinned } = await pinManager.isPinnedWithType(cid, type)

          if (pinned) {
            switch (reason) {
              case PinTypes.direct:
              case PinTypes.recursive:
                results.push({
                  hash: key,
                  type: reason
                })
                break
              default:
                results.push({
                  hash: key,
                  type: `${PinTypes.indirect} through ${reason}`
                })
            }
          }
        }

        if (!results.length) {
          throw new Error(`path '${paths}' is not pinned`)
        }

        return results
      }

      // show all pinned items of type
      let pins = []

      if (type === PinTypes.direct || type === PinTypes.all) {
        pins = pins.concat(
          Array.from(pinManager.directPins).map(hash => ({
            type: PinTypes.direct,
            hash
          }))
        )
      }

      if (type === PinTypes.recursive || type === PinTypes.all) {
        pins = pins.concat(
          Array.from(pinManager.recursivePins).map(hash => ({
            type: PinTypes.recursive,
            hash
          }))
        )
      }

      if (type === PinTypes.indirect || type === PinTypes.all) {
        const indirects = await pinManager.getIndirectKeys(options)

        pins = pins
          // if something is pinned both directly and indirectly,
          // report the indirect entry
          .filter(({ hash }) =>
            !indirects.includes(hash) ||
            (indirects.includes(hash) && !pinManager.directPins.has(hash))
          )
          .concat(indirects.map(hash => ({
            type: PinTypes.indirect,
            hash
          })))

        return pins
      }

      return pins
    }),

    // used by tests
    pinManager
  }

  return pin
}
