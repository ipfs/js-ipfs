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
const Ipld = require('ipld')
const BlockService = require('ipfs-block-service')

const { resolvePath } = require('../utils')
const ipldOptions = require('../runtime/ipld-nodejs')
const components = require('../components')
const PinManager = require('./pin/pin-manager')
const PinTypes = PinManager.PinTypes

function toB58String (hash) {
  return new CID(hash).toBaseEncodedString()
}

// The pinner uses BlockService to store pin sets internally. We don't want
// to expose these internal blocks to the network, so we create an offline
// BlockService (one that doesn't talk to Bitswap)
function createOfflineDag (self) {
  const offlineBlockService = new BlockService(self._repo)
  const offlineIpld = new Ipld(ipldOptions(offlineBlockService, self._options.ipld, self.log))
  return components.dag(self, offlineIpld)
}

module.exports = (self) => {
  const dag = createOfflineDag(self)
  const pinManager = new PinManager(self._repo, dag, self._options.repoOwner, self.log)

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
            const key = toB58String(multihash)
            if (recursive) {
              if (pinManager.recursivePins.has(key)) {
                // it's already pinned recursively
                return cb(null, null)
              }

              // entire graph of nested links should be pinned,
              // so make sure we have all the objects
              dag._getRecursive(key, { preload: options.preload }, (err) => {
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
                return cb(null, null)
              }

              // make sure we have the object
              dag.get(new CID(multihash), { preload: options.preload }, (err) => {
                if (err) { return cb(err) }
                // found the object, we can add the pin
                return cb(null, key)
              })
            }
          }, (err, results) => {
            if (err) { return pinComplete(err) }

            const flushComplete = (err) => {
              if (err) { return pinComplete(err) }
              pinComplete(null, mhs.map(mh => ({ hash: toB58String(mh) })))
            }

            // each result is either a key or null if there is already a pin
            results = results.filter(Boolean)
            if (!results.length) { return flushComplete() }

            if (recursive) {
              pinManager.addRecursivePins(results, flushComplete)
            } else {
              pinManager.addDirectPins(results, flushComplete)
            }
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

            pinManager.rmPins(results, recursive, (err) => {
              if (err) { return lockCb(err) }
              self.log(`Removed pins: ${results}`)
              lockCb(null, mhs.map(mh => ({ hash: toB58String(mh) })))
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
          (hashes, cb) => mapSeries(hashes, (hash, done) => pinManager.isPinnedWithType(hash, PinTypes.all, done), cb),
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
              return cb(new Error(`Path is not pinned`))
            }

            cb(null, results)
          }
        ], callback)
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
          pinManager.getIndirectKeys((err, indirects) => {
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
