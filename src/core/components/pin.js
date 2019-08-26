/* eslint max-nested-callbacks: ["error", 8] */
'use strict'

const promisify = require('promisify-es6')
const CID = require('cids')
const map = require('async/map')
const mapSeries = require('async/mapSeries')
const waterfall = require('async/waterfall')
const setImmediate = require('async/setImmediate')
const errCode = require('err-code')
const multibase = require('multibase')

const { resolvePath } = require('../utils')
const PinManager = require('./pin/pin-manager')
const PinTypes = PinManager.PinTypes

function toB58String (hash) {
  return new CID(hash).toBaseEncodedString()
}

module.exports = (self) => {
  const dag = self.dag
  const pinManager = new PinManager(self._repo, dag)

  const pin = {
    add: promisify((paths, options, callback) => {
      if (typeof options === 'function') {
        callback = options
        options = {}
      }

      options = options || {}

      const recursive = options.recursive == null ? true : options.recursive

      resolvePath(self.object, paths, (err, mhs) => {
        if (err) { return callback(err) }

        const pinAdd = (pinComplete) => {
          // verify that each hash can be pinned
          map(mhs, (multihash, cb) => {
            const cid = new CID(multihash)
            const key = cid.toBaseEncodedString()

            if (recursive) {
              if (pinManager.recursivePins.has(key)) {
                // it's already pinned recursively
                return cb(null, key)
              }

              // entire graph of nested links should be pinned,
              // so make sure we have all the objects
              pinManager.fetchCompleteDag(key, { preload: options.preload }, (err) => {
                if (err) { return cb(err) }
                // found all objects, we can add the pin
                return cb(null, key)
              })
            } else {
              if (pinManager.recursivePins.has(key)) {
                // recursive supersedes direct, can't have both
                return cb(new Error(`${key} already pinned recursively`))
              }
              if (pinManager.directPins.has(key)) {
                // already directly pinned
                return cb(null, key)
              }

              // make sure we have the object
              dag.get(cid, { preload: options.preload }, (err) => {
                if (err) { return cb(err) }
                // found the object, we can add the pin
                return cb(null, key)
              })
            }
          }, (err, results) => {
            if (err) { return pinComplete(err) }

            // update the pin sets in memory
            const pinset = recursive ? pinManager.recursivePins : pinManager.directPins
            results.forEach(key => pinset.add(key))

            // persist updated pin sets to datastore
            pinManager.flushPins((err, root) => {
              if (err) { return pinComplete(err) }
              pinComplete(null, results.map(hash => ({ hash })))
            })
          })
        }

        // When adding a file, we take a lock that gets released after pinning
        // is complete, so don't take a second lock here
        const lock = options.lock !== false
        if (lock) {
          self._gcLock.readLock(pinAdd, callback)
        } else {
          pinAdd(callback)
        }
      })
    }),

    rm: promisify((paths, options, callback) => {
      if (typeof options === 'function') {
        callback = options
      }

      options = options || {}

      const recursive = options.recursive == null ? true : options.recursive

      if (options.cidBase && !multibase.names.includes(options.cidBase)) {
        return setImmediate(() => {
          callback(errCode(new Error('invalid multibase'), 'ERR_INVALID_MULTIBASE'))
        })
      }

      resolvePath(self.object, paths, (err, mhs) => {
        if (err) { return callback(err) }

        self._gcLock.readLock((lockCb) => {
          // verify that each hash can be unpinned
          map(mhs, (multihash, cb) => {
            pinManager.isPinnedWithType(multihash, PinTypes.all, (err, res) => {
              if (err) { return cb(err) }
              const { pinned, reason } = res
              const key = toB58String(multihash)
              if (!pinned) {
                return cb(new Error(`${key} is not pinned`))
              }

              switch (reason) {
                case (PinTypes.recursive):
                  if (recursive) {
                    return cb(null, key)
                  } else {
                    return cb(new Error(`${key} is pinned recursively`))
                  }
                case (PinTypes.direct):
                  return cb(null, key)
                default:
                  return cb(new Error(
                    `${key} is pinned indirectly under ${reason}`
                  ))
              }
            })
          }, (err, results) => {
            if (err) { return lockCb(err) }

            // update the pin sets in memory
            results.forEach(key => {
              if (recursive && pinManager.recursivePins.has(key)) {
                pinManager.recursivePins.delete(key)
              } else {
                pinManager.directPins.delete(key)
              }
            })

            // persist updated pin sets to datastore
            pinManager.flushPins((err, root) => {
              if (err) { return lockCb(err) }
              self.log(`Removed pins: ${results}`)
              lockCb(null, results.map(hash => ({ hash })))
            })
          })
        }, callback)
      })
    }),

    ls: promisify((paths, options, callback) => {
      let type = PinTypes.all
      if (typeof paths === 'function') {
        callback = paths
        options = {}
        paths = null
      }
      if (typeof options === 'function') {
        callback = options
      }
      if (paths && paths.type) {
        options = paths
        paths = null
      }

      options = options || {}

      if (options.type) {
        type = options.type
        if (typeof options.type === 'string') {
          type = options.type.toLowerCase()
        }
        const err = PinManager.checkPinType(type)
        if (err) {
          return setImmediate(() => callback(err))
        }
      }

      if (paths) {
        // check the pinned state of specific hashes
        waterfall([
          (cb) => resolvePath(self.object, paths, cb),
          (hashes, cb) => mapSeries(hashes, (hash, done) => pinManager.isPinnedWithType(hash, type, done), cb),
          (results, cb) => {
            results = results
              .filter(result => result.pinned)
              .map(({ key, reason }) => {
                switch (reason) {
                  case PinTypes.direct:
                  case PinTypes.recursive:
                    return {
                      hash: key,
                      type: reason
                    }
                  default:
                    return {
                      hash: key,
                      type: `${PinTypes.indirect} through ${reason}`
                    }
                }
              })

            if (!results.length) {
              return cb(new Error(`path '${paths}' is not pinned`))
            }

            cb(null, results)
          }
        ], (err, results) => err ? callback(err) : callback(null, results)) // we don't want results equal [undefined] when err is present
      } else {
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
          pinManager.getIndirectKeys(options, (err, indirects) => {
            if (err) { return callback(err) }
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
            return callback(null, pins)
          })
        } else {
          callback(null, pins)
        }
      }
    }),

    _isPinnedWithType: promisify(pinManager.isPinnedWithType.bind(pinManager)),
    _getInternalBlocks: promisify(pinManager.getInternalBlocks.bind(pinManager)),
    _load: promisify(pinManager.load.bind(pinManager))
  }

  return pin
}
