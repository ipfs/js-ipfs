/* eslint max-nested-callbacks: ["error", 8] */
'use strict'

const { DAGNode, util } = require('ipld-dag-pb')
const CID = require('cids')
const map = require('async/map')
const parallel = require('async/parallel')
const eachLimit = require('async/eachLimit')
const waterfall = require('async/waterfall')
const detectLimit = require('async/detectLimit')
const { Key } = require('interface-datastore')
const errCode = require('err-code')

const PinStore = require('./pin-store')
const PinSet = require('./pin-set')
const Lock = require('./lock')

// arbitrary limit to the number of concurrent dag operations
const concurrencyLimit = 300
const PIN_DS_KEY = new Key('/local/pins')
const NO_PINS_ERR = 'No pins to load'

function toB58String (hash) {
  return new CID(hash).toBaseEncodedString('base58btc')
}

function invalidPinTypeErr (type) {
  const errMsg = `Invalid type '${type}', must be one of {direct, indirect, recursive, all}`
  return errCode(new Error(errMsg), 'ERR_INVALID_PIN_TYPE')
}

const PinTypes = {
  direct: 'direct',
  recursive: 'recursive',
  indirect: 'indirect',
  all: 'all'
}

class PinManager {
  constructor (repo, dag, repoOwner, log) {
    this.repo = repo
    this.dag = dag
    this.store = new PinStore(dag)
    this.log = log
    this.pinsets = {
      direct: new PinSet(PinTypes.direct, this.store),
      recursive: new PinSet(PinTypes.recursive, this.store)
    }
    this._linkCache = {}
    this._lock = new Lock(repoOwner, 'ipfs:pin-manager:lock')
  }

  getIndirectKeys (callback) {
    this._lock.readLock((lockCb) => {
      const indirectKeys = new Set()
      eachLimit([...this.pinsets.recursive.pinKeys], concurrencyLimit, (multihash, cb) => {
        this.dag._getRecursive(multihash, (err, nodes) => {
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
              // .filter(key => !this.recursivePins.has(key))
              .filter(key => !this.pinsets.recursive.hasPin(key))
              .forEach(key => indirectKeys.add(key))

            cb()
          })
        })
      }, (err) => {
        if (err) { return lockCb(err) }
        lockCb(null, Array.from(indirectKeys))
      })
    }, callback)
  }

  addRecursivePins (keys, callback) {
    this._addPins(keys, this.pinsets.recursive, callback)
  }

  addDirectPins (keys, callback) {
    this._addPins(keys, this.pinsets.direct, callback)
  }

  _addPins (keys, pinset, callback) {
    this._lock.writeLock((lockCb) => {
      // Add pins to the pin set (direct or recursive)
      pinset.addPins(keys, (err, changed) => {
        if (err) { return lockCb(err) }
        // If the pin set was changed, update the root node to point at the
        // changed pin set and write it out
        if (changed) { return this._saveRootNode(lockCb) }
        return lockCb()
      })
    }, callback)
  }

  rmPins (keys, recursive, callback) {
    if (!keys.length) return callback(null, [])

    this._lock.writeLock((lockCb) => {
      const pins = {
        direct: new Set(),
        recursive: new Set()
      }

      for (const key of keys) {
        if (recursive && this.pinsets.recursive.hasPin(key)) {
          pins.recursive.add(key)
        } else {
          pins.direct.add(key)
        }
      }

      waterfall([
        (cb) => parallel([
          // Remove pins from the pin sets
          (pcb) => this.pinsets.direct.rmPins([...pins.direct], pcb),
          (pcb) => this.pinsets.recursive.rmPins([...pins.recursive], pcb)
        ], cb),
        (changed, cb) => {
          // If either of the pin sets was changed, update the root node to
          // point at the changed pin sets and write it out
          if (changed[0] || changed[1]) {
            return this._saveRootNode(cb)
          }
          cb()
        }
      ], lockCb)
    }, callback)
  }

  // Encode and write pin key sets to the datastore:
  // a DAGLink for each of the recursive and direct pinsets
  // a DAGNode holding those as DAGLinks, a kind of root pin
  // Note: should only be called within a lock
  _saveRootNode (callback) {
    let root

    waterfall([
      // ensure that there are nodes for both the direct and recursive pin sets
      (cb) => parallel([
        pcb => this.pinsets.direct.saveSet(pcb),
        pcb => this.pinsets.recursive.saveSet(pcb)
      ], cb),

      // create a root node with DAGLinks to the direct and recursive pin sets
      (res, cb) => {
        try {
          root = DAGNode.create(Buffer.alloc(0), res.map(r => r.link))
        } catch (err) {
          return cb(err)
        }

        this.store.save(root, (err, cid) => {
          if (!err) {
            root.multihash = cid.buffer
          }
          return cb(err)
        })
      },

      // hack for CLI tests
      cb => this.repo.closed ? this.repo.open(cb) : cb(),

      // save root to datastore under a consistent key
      cb => this.repo.datastore.put(PIN_DS_KEY, root.multihash, cb)
    ], (err) => {
      if (err) { return callback(err) }
      this.log(`Flushed pins with root: ${root}`)
      return callback(null, root)
    })
  }

  load (callback) {
    this._lock.writeLock((lockCb) => {
      waterfall([
        // hack for CLI tests
        (cb) => this.repo.closed ? this.repo.datastore.open(cb) : cb(null, null),
        // Get root node CID from datastore
        (_, cb) => this.repo.datastore.has(PIN_DS_KEY, cb),
        (has, cb) => has ? cb() : cb(new Error(NO_PINS_ERR)),
        (cb) => this.repo.datastore.get(PIN_DS_KEY, cb),
        // Load root node
        (mh, cb) => {
          this.store.fetch(new CID(mh), cb)
        }
      ], (err, pinRoot) => {
        if (err) {
          if (err.message === NO_PINS_ERR) {
            this.log('No pins to load')
            return lockCb()
          } else {
            return lockCb(err)
          }
        }

        // Load the direct and recursive pin sets
        parallel([
          cb => this.pinsets.direct.loadSet(pinRoot.value, cb),
          cb => this.pinsets.recursive.loadSet(pinRoot.value, cb)
        ], (err) => {
          if (!err) {
            this.log('Loaded pins from the datastore')
          }
          return lockCb(err)
        })
      })
    }, callback)
  }

  isPinnedWithType (multihash, type, callback) {
    const key = toB58String(multihash)
    const { recursive, direct, all } = PinTypes

    // recursive
    if ((type === recursive || type === all) && this.pinsets.recursive.hasPin(key)) {
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
    if ((type === direct || type === all) && this.pinsets.direct.hasPin(key)) {
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

    this._lock.readLock((lockCb) => {
      // indirect (default)
      // check each recursive key to see if multihash is under it
      // arbitrary limit, enables handling 1000s of pins.
      const cids = [...this.pinsets.recursive.pinKeys].map(key => new CID(key))
      detectLimit(cids, concurrencyLimit, (cid, cb) => {
        waterfall([
          (done) => this.store.fetch(cid, done),
          (result, done) => done(null, result.value),
          (node, done) => this.pinsets.recursive.hasDescendant(node, key, done)
        ], cb)
      }, (err, cid) => lockCb(err, {
        key,
        pinned: Boolean(cid),
        reason: cid
      }))
    }, callback)
  }

  // Gets CIDs of blocks used internally by the pinner
  getInternalBlocks (callback) {
    this._lock.writeLock((lockCb) => {
      this.repo.datastore.get(PIN_DS_KEY, (err, mh) => {
        if (err) {
          if (err.code === 'ERR_NOT_FOUND') {
            this.log(`No pinned blocks`)
            return lockCb(null, [])
          }
          return lockCb(new Error(`Could not get pin sets root from datastore: ${err.message}`))
        }

        const cid = new CID(mh)
        this.store.fetch(cid, (err, obj) => {
          if (err) {
            return lockCb(new Error(`Could not get pin sets from store: ${err.message}`))
          }

          // The pinner stores an object that has two links to pin sets:
          // 1. The directly pinned CIDs
          // 2. The recursively pinned CIDs
          // If large enough, these pin sets may have links to buckets to hold
          // the pins
          PinSet.getInternalCids(this.store, obj.value, (err, cids) => {
            if (err) {
              return lockCb(new Error(`Could not get pinner internal cids: ${err.message}`))
            }

            lockCb(null, cids.concat(cid))
          })
        })
      })
    }, callback)
  }

  // Returns an error if the pin type is invalid
  static checkPinType (type) {
    if (typeof type !== 'string' || !Object.keys(PinTypes).includes(type)) {
      return invalidPinTypeErr(type)
    }
  }
}

PinManager.PinTypes = PinTypes

module.exports = PinManager
