/* eslint max-nested-callbacks: ["error", 8] */
'use strict'

const promisify = require('promisify-es6')
const { DAGNode, DAGLink, util } = require('ipld-dag-pb')
const CID = require('cids')
const map = require('async/map')
const mapSeries = require('async/mapSeries')
const series = require('async/series')
const parallel = require('async/parallel')
const eachLimit = require('async/eachLimit')
const waterfall = require('async/waterfall')
const detectLimit = require('async/detectLimit')
const setImmediate = require('async/setImmediate')
const { Key } = require('interface-datastore')
const errCode = require('err-code')
const multibase = require('multibase')
const multicodec = require('multicodec')

const createPinSet = require('./pin-set')
const { resolvePath } = require('../utils')

// arbitrary limit to the number of concurrent dag operations
const concurrencyLimit = 300
const pinDataStoreKey = new Key('/local/pins')

function toB58String (hash) {
  return new CID(hash).toBaseEncodedString()
}

function invalidPinTypeErr (type) {
  const errMsg = `Invalid type '${type}', must be one of {direct, indirect, recursive, all}`
  return errCode(new Error(errMsg), 'ERR_INVALID_PIN_TYPE')
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
    eachLimit(recursiveKeys(), concurrencyLimit, (multihash, cb) => {
      dag._getRecursive(multihash, (err, nodes) => {
        if (err) {
          return cb(err)
        }

        map(nodes, (node, cb) => util.cid(util.serialize(node), {
          cidVersion: 0
        }).then(cid => cb(null, cid), cb), (err, cids) => {
          if (err) {
            return cb(err)
          }

          cids
            .map(cid => cid.toString())
            // recursive pins pre-empt indirect pins
            .filter(key => !recursivePins.has(key))
            .forEach(key => indirectKeys.add(key))

          cb()
        })
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
    series([
      // create a DAGLink to the node with direct pins
      cb => waterfall([
        cb => pinset.storeSet(directKeys(), cb),
        ({ node, cid }, cb) => {
          try {
            cb(null, new DAGLink(types.direct, node.size, cid))
          } catch (err) {
            cb(err)
          }
        },
        (link, cb) => { dLink = link; cb(null) }
      ], cb),

      // create a DAGLink to the node with recursive pins
      cb => waterfall([
        cb => pinset.storeSet(recursiveKeys(), cb),
        ({ node, cid }, cb) => {
          try {
            cb(null, new DAGLink(types.recursive, node.size, cid))
          } catch (err) {
            cb(err)
          }
        },
        (link, cb) => { rLink = link; cb(null) }
      ], cb),

      // the pin-set nodes link to a special 'empty' node, so make sure it exists
      cb => {
        let empty

        try {
          empty = DAGNode.create(Buffer.alloc(0))
        } catch (err) {
          return cb(err)
        }

        dag.put(empty, {
          version: 0,
          format: multicodec.DAG_PB,
          hashAlg: multicodec.SHA2_256,
          preload: false
        }, cb)
      },

      // create a root node with DAGLinks to the direct and recursive DAGs
      cb => {
        let node

        try {
          node = DAGNode.create(Buffer.alloc(0), [dLink, rLink])
        } catch (err) {
          return cb(err)
        }

        root = node
        dag.put(root, {
          version: 0,
          format: multicodec.DAG_PB,
          hashAlg: multicodec.SHA2_256,
          preload: false
        }, (err, cid) => {
          if (!err) {
            root.multihash = cid.buffer
          }
          cb(err)
        })
      },

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
        options = {}
      }

      options = options || {}

      const recursive = options.recursive == null ? true : options.recursive

      resolvePath(self.object, paths, (err, mhs) => {
        if (err) { return callback(err) }

        // verify that each hash can be pinned
        map(mhs, (multihash, cb) => {
          const key = toB58String(multihash)
          if (recursive) {
            if (recursivePins.has(key)) {
              // it's already pinned recursively
              return cb(null, key)
            }

            // entire graph of nested links should be pinned,
            // so make sure we have all the objects
            dag._getRecursive(key, { preload: options.preload }, (err) => {
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
            dag.get(new CID(multihash), { preload: options.preload }, (err) => {
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
            callback(null, results.map(hash => ({ hash })))
          })
        })
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

        // verify that each hash can be unpinned
        map(mhs, (multihash, cb) => {
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
            callback(null, results.map(hash => ({ hash })))
          })
        })
      })
    }),

    ls: promisify((paths, options, callback) => {
      let type = types.all
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
        if (typeof options.type !== 'string') {
          return setImmediate(() => callback(invalidPinTypeErr(options.type)))
        }
        type = options.type.toLowerCase()
      }
      if (!Object.keys(types).includes(type)) {
        return setImmediate(() => callback(invalidPinTypeErr(type)))
      }

      if (paths) {
        // check the pinned state of specific hashes
        waterfall([
          (cb) => resolvePath(self.object, paths, cb),
          (hashes, cb) => mapSeries(hashes, (hash, done) => pin._isPinnedWithType(hash, types.all, done), cb),
          (results, cb) => {
            results = results
              .filter(result => result.pinned)
              .map(({ key, reason }) => {
                switch (reason) {
                  case types.direct:
                  case types.recursive:
                    return {
                      hash: key,
                      type: reason
                    }
                  default:
                    return {
                      hash: key,
                      type: `${types.indirect} through ${reason}`
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
          callback(null, pins)
        }
      }
    }),

    _isPinnedWithType: promisify((multihash, type, callback) => {
      const key = toB58String(multihash)
      const { recursive, direct, all } = types

      // recursive
      if ((type === recursive || type === all) && recursivePins.has(key)) {
        return callback(null, {
          key,
          pinned: true,
          reason: recursive
        })
      }

      if (type === recursive) {
        return callback(null, {
          key,
          pinned: false
        })
      }

      // direct
      if ((type === direct || type === all) && directPins.has(key)) {
        return callback(null, {
          key,
          pinned: true,
          reason: direct
        })
      }

      if (type === direct) {
        return callback(null, {
          key,
          pinned: false
        })
      }

      // indirect (default)
      // check each recursive key to see if multihash is under it
      // arbitrary limit, enables handling 1000s of pins.
      detectLimit(recursiveKeys().map(key => new CID(key)), concurrencyLimit, (cid, cb) => {
        waterfall([
          (done) => dag.get(cid, '', { preload: false }, done),
          (result, done) => done(null, result.value),
          (node, done) => pinset.hasDescendant(node, key, done)
        ], cb)
      }, (err, cid) => callback(err, {
        key,
        pinned: Boolean(cid),
        reason: cid
      }))
    }),

    _load: promisify(callback => {
      waterfall([
        // hack for CLI tests
        (cb) => repo.closed ? repo.datastore.open(cb) : cb(null, null),
        (_, cb) => repo.datastore.has(pinDataStoreKey, cb),
        (has, cb) => has ? cb() : cb(new Error('No pins to load')),
        (cb) => repo.datastore.get(pinDataStoreKey, cb),
        (mh, cb) => {
          dag.get(new CID(mh), '', { preload: false }, cb)
        }
      ], (err, pinRoot) => {
        if (err) {
          if (err.message === 'No pins to load') {
            self.log('No pins to load')
            return callback()
          } else {
            return callback(err)
          }
        }

        parallel([
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
