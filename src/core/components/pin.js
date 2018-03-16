'use strict'

const dagPB = require('ipld-dag-pb')
const DAGNode = dagPB.DAGNode
const DAGLink = dagPB.DAGLink
const CID = require('cids')
const pinSet = require('./pin-set')
const normalizeHashes = require('../utils').normalizeHashes
const promisify = require('promisify-es6')
const multihashes = require('multihashes')
const each = require('async/each')
const series = require('async/series')
const waterfall = require('async/waterfall')
const until = require('async/until')
const once = require('once')

function toB58String (hash) {
  return new CID(hash).toBaseEncodedString()
}

module.exports = function pin (self) {
  let directPins = new Set()
  let recursivePins = new Set()
  let internalPins = new Set()

  const pinDataStoreKey = '/local/pins'

  const repo = self._repo
  const dag = self.dag

  const pin = {
    types: {
      direct: 'direct',
      recursive: 'recursive',
      indirect: 'indirect',
      internal: 'internal',
      all: 'all'
    },

    clear: () => {
      directPins.clear()
      recursivePins.clear()
      internalPins.clear()
    },

    set: pinSet(dag),

    add: promisify((hashes, options, callback) => {
      if (typeof options === 'function') {
        callback = options
        options = null
      }
      callback = once(callback)
      const recursive = options ? options.recursive : true
      normalizeHashes(self, hashes, (err, mhs) => {
        if (err) { return callback(err) }
        // verify that each hash can be pinned
        series(mhs.map(multihash => cb => {
          const key = toB58String(multihash)
          if (recursive) {
            if (recursivePins.has(key)) {
              // it's already pinned recursively
              return cb(null, key)
            }
            // entire graph of nested links should be pinned,
            // so make sure we have all the objects
            dag._getRecursive(multihash, (err) => {
              if (err) { return cb(err) }
              // found all objects, we can add the pin
              return cb(null, key)
            })
          } else {
            if (recursivePins.has(key)) {
              // recursive supersedes direct, can't have both
              return cb(new Error(`${key} already pinned recursively`))
            }
            if (directPins.has(key)) {
              // already directly pinned
              return cb(null, key)
            }
            // make sure we have the object
            dag.get(new CID(multihash), (err) => {
              if (err) { return cb(err) }
              // found the object, we can add the pin
              return cb(null, key)
            })
          }
        }), (err, results) => {
          if (err) { return callback(err) }
          // update the pin sets in memory
          if (recursive) {
            results.forEach(key => {
              // recursive pin should replace direct pin
              directPins.delete(key)
              recursivePins.add(key)
            })
          } else {
            results.forEach(key => directPins.add(key))
          }
          // persist updated pin sets to datastore
          pin.flush((err, root) => {
            if (err) { return callback(err) }
            self.log(`Added pins: ${results}`)
            return callback(null, results.map(key => ({hash: key})))
          })
        })
      })
    }),

    rm: promisify((hashes, options, callback) => {
      let recursive = true
      if (typeof options === 'function') {
        callback = options
      } else if (options && options.recursive === false) {
        recursive = false
      }
      callback = once(callback)
      normalizeHashes(self, hashes, (err, mhs) => {
        if (err) { return callback(err) }
        // verify that each hash can be unpinned
        series(mhs.map(multihash => cb => {
          pin.isPinnedWithType(multihash, pin.types.all, (err, res) => {
            if (err) { return cb(err) }
            const { pinned, reason } = res
            const key = toB58String(multihash)
            if (!pinned) {
              return cb(new Error(`${key} is not pinned`))
            }
            switch (reason) {
              case (pin.types.recursive):
                if (recursive) {
                  return cb(null, key)
                } else {
                  return cb(new Error(`${key} is pinned recursively`))
                }
              case (pin.types.direct):
                return cb(null, key)
              default:
                return cb(new Error(
                  `${key} is pinned indirectly under ${reason}`
                ))
            }
          })
        }), (err, results) => {
          if (err) { return callback(err) }
          // update the pin sets in memory
          const pins = recursive ? recursivePins : directPins
          results.forEach(key => pins.delete(key))
          // persist updated pin sets to datastore
          pin.flush((err, root) => {
            if (err) { return callback(err) }
            self.log(`Removed pins: ${results}`)
            return callback(null, results.map(key => ({hash: key})))
          })
        })
      })
    }),

    ls: promisify((hashes, options, callback) => {
      let type = pin.types.all
      if (typeof hashes === 'function') {
        callback = hashes
        options = null
        hashes = null
      }
      if (typeof options === 'function') {
        callback = options
      }
      if (hashes && hashes.type) {
        options = hashes
        hashes = null
      }
      if (options && options.type) {
        type = options.type.toLowerCase()
      }
      callback = once(callback)
      if (!pin.types[type]) {
        return callback(new Error(
          `Invalid type '${type}', must be one of {direct, indirect, recursive, all}`
        ))
      }
      if (hashes) {
        // check the pinned state of specific hashes
        normalizeHashes(self, hashes, (err, mhs) => {
          if (err) { return callback(err) }
          series(mhs.map(multihash => cb => {
            pin.isPinnedWithType(multihash, pin.types.all, (err, res) => {
              if (err) { return cb(err) }
              const { pinned, reason } = res
              const key = toB58String(multihash)
              if (!pinned) {
                return cb(new Error(
                  `Path ${key} is not pinned`
                ))
              }
              switch (reason) {
                case pin.types.direct:
                case pin.types.recursive:
                  return cb(null, {
                    hash: key,
                    type: reason
                  })
                default:
                  return cb(null, {
                    hash: key,
                    type: `${pin.types.indirect} through ${reason}`
                  })
              }
            })
          }), callback)
        })
      } else {
        // show all pinned items of type
        const result = []
        if (type === pin.types.direct || type === pin.types.all) {
          pin.directKeyStrings().forEach((hash) => {
            result.push({
              type: pin.types.direct,
              hash: hash
            })
          })
        }
        if (type === pin.types.recursive || type === pin.types.all) {
          pin.recursiveKeyStrings().forEach((hash) => {
            result.push({
              type: pin.types.recursive,
              hash: hash
            })
          })
        }
        if (type === pin.types.indirect || type === pin.types.all) {
          pin.getIndirectKeys((err, hashes) => {
            if (err) { return callback(err) }
            hashes.forEach((hash) => {
              result.push({
                type: pin.types.indirect,
                hash: hash
              })
            })
            return callback(null, result)
          })
        } else {
          return callback(null, result)
        }
      }
    }),

    isPinned: (multihash, callback) => {
      pin.isPinnedWithType(multihash, pin.types.all, callback)
    },

    isPinnedWithType: (multihash, pinType, callback) => {
      const key = toB58String(multihash)
      // recursive
      if ((pinType === pin.types.recursive || pinType === pin.types.all) &&
          recursivePins.has(key)) {
        return callback(null, {pinned: true, reason: pin.types.recursive})
      }
      if ((pinType === pin.types.recursive)) {
        return callback(null, {pinned: false})
      }
      // direct
      if ((pinType === pin.types.direct || pinType === pin.types.all) &&
          directPins.has(key)) {
        return callback(null, {pinned: true, reason: pin.types.direct})
      }
      if ((pinType === pin.types.direct)) {
        return callback(null, {pinned: false})
      }
      // internal
      if ((pinType === pin.types.internal || pinType === pin.types.all) &&
          internalPins.has(key)) {
        return callback(null, {pinned: true, reason: pin.types.internal})
      }
      if ((pinType === pin.types.internal)) {
        return callback(null, {pinned: false})
      }

      // indirect (default)
      // check each recursive key to see if multihash is under it
      const rKeys = pin.recursiveKeys()
      let found = false
      until(
        // search until multihash was found or no more keys to check
        () => (found || !rKeys.length),
        (cb) => {
          const key = rKeys.pop()
          dag.get(new CID(key), (err, res) => {
            if (err) { return cb(err) }
            pin.set.hasChild(res.value, multihash, (err, has) => {
              if (err) { return cb(err) }
              found = has
              // if found, return the hash of the parent recursive pin
              cb(null, found ? toB58String(res.value.multihash) : null)
            })
          })
        },
        (err, result) => {
          if (err) { return callback(err) }
          return callback(null, {pinned: found, reason: result})
        }
      )
    },

    directKeyStrings: () => Array.from(directPins),

    recursiveKeyStrings: () => Array.from(recursivePins),

    internalKeyStrings: () => Array.from(internalPins),

    directKeys: () => pin.directKeyStrings().map(key => multihashes.fromB58String(key)),

    recursiveKeys: () => pin.recursiveKeyStrings().map(key => multihashes.fromB58String(key)),

    internalKeys: () => pin.internalKeyStrings().map(key => multihashes.fromB58String(key)),

    getIndirectKeys: (callback) => {
      const indirectKeys = new Set()
      const rKeys = pin.recursiveKeys()
      each(rKeys, (multihash, cb) => {
        dag._getRecursive(multihash, (err, nodes) => {
          if (err) { return cb(err) }
          nodes.forEach((node) => {
            const key = toB58String(node.multihash)
            if (!directPins.has(key) && !recursivePins.has(key)) {
              // not already pinned recursively or directly
              indirectKeys.add(key)
            }
          })
          cb()
        })
      }, (err) => {
        if (err) { return callback(err) }
        callback(null, Array.from(indirectKeys))
      })
    },

    // encodes and writes pin key sets to the datastore
    // each key set will be stored as a DAG node, and a root node will link to both
    flush: promisify((callback) => {
      const newInternalPins = new Set()
      const logInternalKey = (mh) => newInternalPins.add(toB58String(mh))
      const handle = {
        put: (k, v, cb) => {
          handle[k] = v
          cb()
        }
      }
      waterfall([
        // create link to direct keys node
        (cb) => pin.set.storeSet(pin.directKeys(), logInternalKey, cb),
        (dRoot, cb) => DAGLink.create(pin.types.direct, dRoot.size, dRoot.multihash, cb),
        (dLink, cb) => handle.put('dLink', dLink, cb),
        // create link to recursive keys node
        (cb) => pin.set.storeSet(pin.recursiveKeys(), logInternalKey, cb),
        (rRoot, cb) => DAGLink.create(pin.types.recursive, rRoot.size, rRoot.multihash, cb),
        (rLink, cb) => handle.put('rLink', rLink, cb),
        // the pin-set nodes link to an empty node, so make sure it's added to dag
        (cb) => DAGNode.create(Buffer.alloc(0), cb),
        (empty, cb) => dag.put(empty, {cid: new CID(empty.multihash)}, cb),
        // create root node with links to direct and recursive nodes
        (cid, cb) => DAGNode.create(Buffer.alloc(0), [handle.dLink, handle.rLink], cb),
        (root, cb) => handle.put('root', root, cb),
        // add the root node to dag
        (cb) => dag.put(handle.root, {cid: new CID(handle.root.multihash)}, cb),
        // update the internal pin set
        (cid, cb) => cb(null, logInternalKey(handle.root.multihash)),
        // save serialized root to datastore under a consistent key
        (_, cb) => repo.closed ? repo.datastore.open(cb) : cb(null, null), // hack for CLI tests
        (_, cb) => repo.datastore.put(pinDataStoreKey, handle.root.multihash, cb)
      ], (err, result) => {
        if (err) { return callback(err) }
        self.log(`Flushed ${handle.root} to the datastore.`)
        internalPins = newInternalPins
        return callback(null, handle.root)
      })
    }),

    load: promisify((callback) => {
      const newInternalPins = new Set()
      const logInternalKey = (mh) => newInternalPins.add(toB58String(mh))
      const handle = {
        put: (k, v, cb) => {
          handle[k] = v
          cb()
        }
      }
      waterfall([
        (cb) => repo.closed ? repo.datastore.open(cb) : cb(null, null), // hack for CLI tests
        (_, cb) => repo.datastore.has(pinDataStoreKey, cb),
        (has, cb) => has ? cb() : cb('No pins to load'),
        (cb) => repo.datastore.get(pinDataStoreKey, cb),
        (mh, cb) => dag.get(new CID(mh), cb),
        (root, cb) => handle.put('root', root.value, cb),
        (cb) => pin.set.loadSet(handle.root, pin.types.recursive, logInternalKey, cb),
        (rKeys, cb) => handle.put('rKeys', rKeys, cb),
        (cb) => pin.set.loadSet(handle.root, pin.types.direct, logInternalKey, cb)
      ], (err, dKeys) => {
        if (err && err !== 'No pins to load') {
          return callback(err)
        }
        if (dKeys) {
          directPins = new Set(dKeys.map(mh => toB58String(mh)))
          recursivePins = new Set(handle.rKeys.map(mh => toB58String(mh)))
          logInternalKey(handle.root.multihash)
          internalPins = newInternalPins
        }
        self.log('Loaded pins from the datastore')
        return callback()
      })
    })
  }
  return pin
}
