/* eslint max-nested-callbacks: ["error", 8] */
'use strict'

const promisify = require('promisify-es6')
const { DAGNode, DAGLink } = require('ipld-dag-pb')
const CID = require('cids')
const async = require('async')
const { Key } = require('interface-datastore')

const createPinSet = require('./pin-set')
const { resolvePath } = require('../utils')

// arbitrary limit to the number of concurrent dag operations
const concurrencyLimit = 300
const pinDataStoreKey = new Key('/local/pins')

function toB58String (hash) {
  return new CID(hash).toBaseEncodedString()
}

module.exports = (self) => {
  const repo = self._repo
  const dag = self.dag
  const pinset = createPinSet(dag)
  const types = {
    direct: 'direct',
    recursive: 'recursive',
    indirect: 'indirect',
    all: 'all'
  }

  let directPins = new Set()
  let recursivePins = new Set()

  const directKeys = () =>
    Array.from(directPins).map(key => new CID(key).buffer)
  const recursiveKeys = () =>
    Array.from(recursivePins).map(key => new CID(key).buffer)

  function getIndirectKeys (callback) {
    const indirectKeys = new Set()
    async.eachLimit(recursiveKeys(), concurrencyLimit, (multihash, cb) => {
      dag._getRecursive(multihash, (err, nodes) => {
        if (err) { return cb(err) }

        nodes
          .map(({ multihash }) => toB58String(multihash))
          // recursive pins pre-empt indirect pins
          .filter(key => !recursivePins.has(key))
          .forEach(key => indirectKeys.add(key))

        cb()
      })
    }, (err) => {
      if (err) { return callback(err) }
      callback(null, Array.from(indirectKeys))
    })
  }

  // Encode and write pin key sets to the datastore:
  // a DAGLink for each of the recursive and direct pinsets
  // a DAGNode holding those as DAGLinks, a kind of root pin
  function flushPins (callback) {
    let dLink, rLink, root
    async.series([
      // create a DAGLink to the node with direct pins
      cb => async.waterfall([
        cb => pinset.storeSet(directKeys(), cb),
        (node, cb) => DAGLink.create(types.direct, node.size, node.multihash, cb),
        (link, cb) => { dLink = link; cb(null) }
      ], cb),

      // create a DAGLink to the node with recursive pins
      cb => async.waterfall([
        cb => pinset.storeSet(recursiveKeys(), cb),
        (node, cb) => DAGLink.create(types.recursive, node.size, node.multihash, cb),
        (link, cb) => { rLink = link; cb(null) }
      ], cb),

      // the pin-set nodes link to a special 'empty' node, so make sure it exists
      cb => DAGNode.create(Buffer.alloc(0), (err, empty) => {
        if (err) { return cb(err) }
        dag.put(empty, { cid: new CID(empty.multihash), preload: false }, cb)
      }),

      // create a root node with DAGLinks to the direct and recursive DAGs
      cb => DAGNode.create(Buffer.alloc(0), [dLink, rLink], (err, node) => {
        if (err) { return cb(err) }
        root = node
        dag.put(root, { cid: new CID(root.multihash), preload: false }, cb)
      }),

      // hack for CLI tests
      cb => repo.closed ? repo.open(cb) : cb(null, null),

      // save root to datastore under a consistent key
      cb => repo.datastore.put(pinDataStoreKey, root.multihash, cb)
    ], (err, res) => {
      if (err) { return callback(err) }
      self.log(`Flushed pins with root: ${root}`)
      return callback(null, root)
    })
  }

  const pin = {
    add: promisify((paths, options, callback) => {
      if (typeof options === 'function') {
        callback = options
        options = null
      }
      const recursive = options ? options.recursive : true

      resolvePath(self.object, paths, (err, mhs) => {
        if (err) { return callback(err) }

        // verify that each hash can be pinned
        async.map(mhs, (multihash, cb) => {
          const key = toB58String(multihash)
          if (recursive) {
            if (recursivePins.has(key)) {
              // it's already pinned recursively
              return cb(null, key)
            }

            // entire graph of nested links should be pinned,
            // so make sure we have all the objects
            dag._getRecursive(key, (err) => {
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
        }, (err, results) => {
          if (err) { return callback(err) }

          // update the pin sets in memory
          const pinset = recursive ? recursivePins : directPins
          results.forEach(key => pinset.add(key))

          // persist updated pin sets to datastore
          flushPins((err, root) => {
            if (err) { return callback(err) }
            return callback(null, results.map(hash => ({ hash })))
          })
        })
      })
    }),

    rm: promisify((paths, options, callback) => {
      let recursive = true
      if (typeof options === 'function') {
        callback = options
      } else if (options && options.recursive === false) {
        recursive = false
      }

      resolvePath(self.object, paths, (err, mhs) => {
        if (err) { return callback(err) }

        // verify that each hash can be unpinned
        async.map(mhs, (multihash, cb) => {
          pin._isPinnedWithType(multihash, types.all, (err, res) => {
            if (err) { return cb(err) }
            const { pinned, reason } = res
            const key = toB58String(multihash)
            if (!pinned) {
              return cb(new Error(`${key} is not pinned`))
            }

            switch (reason) {
              case (types.recursive):
                if (recursive) {
                  return cb(null, key)
                } else {
                  return cb(new Error(`${key} is pinned recursively`))
                }
              case (types.direct):
                return cb(null, key)
              default:
                return cb(new Error(
                  `${key} is pinned indirectly under ${reason}`
                ))
            }
          })
        }, (err, results) => {
          if (err) { return callback(err) }

          // update the pin sets in memory
          results.forEach(key => {
            if (recursive && recursivePins.has(key)) {
              recursivePins.delete(key)
            } else {
              directPins.delete(key)
            }
          })

          // persist updated pin sets to datastore
          flushPins((err, root) => {
            if (err) { return callback(err) }
            self.log(`Removed pins: ${results}`)
            return callback(null, results.map(hash => ({ hash })))
          })
        })
      })
    }),

    ls: promisify((paths, options, callback) => {
      let type = types.all
      if (typeof paths === 'function') {
        callback = paths
        options = null
        paths = null
      }
      if (typeof options === 'function') {
        callback = options
      }
      if (paths && paths.type) {
        options = paths
        paths = null
      }
      if (options && options.type) {
        type = options.type.toLowerCase()
      }
      if (!types[type]) {
        return callback(new Error(
          `Invalid type '${type}', must be one of {direct, indirect, recursive, all}`
        ))
      }

      if (paths) {
        // check the pinned state of specific hashes
        resolvePath(self.object, paths, (err, mhs) => {
          if (err) { return callback(err) }

          async.mapSeries(mhs, (multihash, cb) => {
            pin._isPinnedWithType(multihash, types.all, (err, res) => {
              if (err) { return cb(err) }
              const { pinned, reason } = res
              const key = toB58String(multihash)
              if (!pinned) {
                return cb(new Error(`Path ${key} is not pinned`))
              }

              switch (reason) {
                case types.direct:
                case types.recursive:
                  return cb(null, {
                    hash: key,
                    type: reason
                  })
                default:
                  return cb(null, {
                    hash: key,
                    type: `${types.indirect} through ${reason}`
                  })
              }
            })
          }, callback)
        })
      } else {
        // show all pinned items of type
        let pins = []
        if (type === types.direct || type === types.all) {
          pins = pins.concat(
            Array.from(directPins).map(hash => ({
              type: types.direct,
              hash
            }))
          )
        }
        if (type === types.recursive || type === types.all) {
          pins = pins.concat(
            Array.from(recursivePins).map(hash => ({
              type: types.recursive,
              hash
            }))
          )
        }
        if (type === types.indirect || type === types.all) {
          getIndirectKeys((err, indirects) => {
            if (err) { return callback(err) }
            pins = pins
              // if something is pinned both directly and indirectly,
              // report the indirect entry
              .filter(({ hash }) =>
                !indirects.includes(hash) ||
                (indirects.includes(hash) && !directPins.has(hash))
              )
              .concat(indirects.map(hash => ({
                type: types.indirect,
                hash
              })))
            return callback(null, pins)
          })
        } else {
          return callback(null, pins)
        }
      }
    }),

    _isPinnedWithType: promisify((multihash, type, callback) => {
      const key = toB58String(multihash)
      const { recursive, direct, all } = types
      // recursive
      if ((type === recursive || type === all) && recursivePins.has(key)) {
        return callback(null, {pinned: true, reason: recursive})
      }
      if ((type === recursive)) {
        return callback(null, {pinned: false})
      }
      // direct
      if ((type === direct || type === all) && directPins.has(key)) {
        return callback(null, {pinned: true, reason: direct})
      }
      if ((type === direct)) {
        return callback(null, {pinned: false})
      }

      // indirect (default)
      // check each recursive key to see if multihash is under it
      // arbitrary limit, enables handling 1000s of pins.
      let foundPin
      async.someLimit(recursiveKeys(), concurrencyLimit, (key, cb) => {
        dag.get(new CID(key), (err, res) => {
          if (err) { return cb(err) }

          pinset.hasDescendant(res.value, multihash, (err, has) => {
            if (has) {
              foundPin = toB58String(res.value.multihash)
            }
            cb(err, has)
          })
        })
      }, (err, found) => {
        if (err) { return callback(err) }
        return callback(null, { pinned: found, reason: foundPin })
      })
    }),

    _load: promisify(callback => {
      async.waterfall([
        // hack for CLI tests
        (cb) => repo.closed ? repo.datastore.open(cb) : cb(null, null),
        (_, cb) => repo.datastore.has(pinDataStoreKey, cb),
        (has, cb) => has ? cb() : cb(new Error('No pins to load')),
        (cb) => repo.datastore.get(pinDataStoreKey, cb),
        (mh, cb) => dag.get(new CID(mh), '', { preload: false }, cb)
      ], (err, pinRoot) => {
        if (err) {
          if (err.message === 'No pins to load') {
            self.log('No pins to load')
            return callback()
          } else {
            return callback(err)
          }
        }

        async.parallel([
          cb => pinset.loadSet(pinRoot.value, types.recursive, cb),
          cb => pinset.loadSet(pinRoot.value, types.direct, cb)
        ], (err, keys) => {
          if (err) { return callback(err) }
          const [ rKeys, dKeys ] = keys

          directPins = new Set(dKeys.map(toB58String))
          recursivePins = new Set(rKeys.map(toB58String))

          self.log('Loaded pins from the datastore')
          return callback(null)
        })
      })
    })
  }

  return pin
}
