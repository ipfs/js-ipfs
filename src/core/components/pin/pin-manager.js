/* eslint max-nested-callbacks: ["error", 8] */
'use strict'

const { DAGNode, DAGLink } = require('ipld-dag-pb')
const CID = require('cids')
const series = require('async/series')
const parallel = require('async/parallel')
const eachLimit = require('async/eachLimit')
const waterfall = require('async/waterfall')
const detectLimit = require('async/detectLimit')
const queue = require('async/queue')
const { Key } = require('interface-datastore')
const errCode = require('err-code')
const multicodec = require('multicodec')
const debug = require('debug')
const { cidToString } = require('../../../utils/cid')

const createPinSet = require('./pin-set')

// arbitrary limit to the number of concurrent dag operations
const concurrencyLimit = 300
const PIN_DS_KEY = new Key('/local/pins')

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
  constructor (repo, dag) {
    this.repo = repo
    this.dag = dag
    this.log = debug('ipfs:pin')
    this.pinset = createPinSet(dag)
    this.directPins = new Set()
    this.recursivePins = new Set()
  }

  _walkDag ({ cid, preload = false, onCid = () => {} }, cb) {
    const q = queue(({ cid }, done) => {
      this.dag.get(cid, { preload }, (err, result) => {
        if (err) {
          return done(err)
        }

        onCid(cid)

        if (result.value.Links) {
          q.push(result.value.Links.map(link => ({
            cid: link.Hash
          })))
        }

        done()
      })
    }, concurrencyLimit)
    q.drain = () => {
      cb()
    }
    q.error = (err) => {
      q.kill()
      cb(err)
    }
    q.push({ cid })
  }

  directKeys () {
    return Array.from(this.directPins, key => new CID(key).buffer)
  }

  recursiveKeys () {
    return Array.from(this.recursivePins, key => new CID(key).buffer)
  }

  getIndirectKeys ({ preload }, callback) {
    const indirectKeys = new Set()
    eachLimit(this.recursiveKeys(), concurrencyLimit, (multihash, cb) => {
      this._walkDag({
        cid: new CID(multihash),
        preload: preload || false,
        onCid: (cid) => {
          cid = cid.toString()

          // recursive pins pre-empt indirect pins
          if (!this.recursivePins.has(cid)) {
            indirectKeys.add(cid)
          }
        }
      }, cb)
    }, (err) => {
      if (err) { return callback(err) }
      callback(null, Array.from(indirectKeys))
    })
  }

  // Encode and write pin key sets to the datastore:
  // a DAGLink for each of the recursive and direct pinsets
  // a DAGNode holding those as DAGLinks, a kind of root pin
  flushPins (callback) {
    let dLink, rLink, root
    series([
      // create a DAGLink to the node with direct pins
      cb => waterfall([
        cb => this.pinset.storeSet(this.directKeys(), cb),
        ({ node, cid }, cb) => {
          try {
            cb(null, new DAGLink(PinTypes.direct, node.size, cid))
          } catch (err) {
            cb(err)
          }
        },
        (link, cb) => { dLink = link; cb(null) }
      ], cb),

      // create a DAGLink to the node with recursive pins
      cb => waterfall([
        cb => this.pinset.storeSet(this.recursiveKeys(), cb),
        ({ node, cid }, cb) => {
          try {
            cb(null, new DAGLink(PinTypes.recursive, node.size, cid))
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

        this.dag.put(empty, {
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
        this.dag.put(root, {
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

      // save root to datastore under a consistent key
      cb => this.repo.datastore.put(PIN_DS_KEY, root.multihash, cb)
    ], (err, res) => {
      if (err) { return callback(err) }
      this.log(`Flushed pins with root: ${root}`)
      return callback(null, root)
    })
  }

  load (callback) {
    waterfall([
      (cb) => this.repo.datastore.has(PIN_DS_KEY, cb),
      (has, cb) => has ? cb() : cb(new Error('No pins to load')),
      (cb) => this.repo.datastore.get(PIN_DS_KEY, cb),
      (mh, cb) => {
        this.dag.get(new CID(mh), '', { preload: false }, cb)
      }
    ], (err, pinRoot) => {
      if (err) {
        if (err.message === 'No pins to load') {
          this.log('No pins to load')
          return callback()
        } else {
          return callback(err)
        }
      }

      parallel([
        cb => this.pinset.loadSet(pinRoot.value, PinTypes.recursive, cb),
        cb => this.pinset.loadSet(pinRoot.value, PinTypes.direct, cb)
      ], (err, keys) => {
        if (err) { return callback(err) }
        const [rKeys, dKeys] = keys

        this.directPins = new Set(dKeys.map(k => cidToString(k)))
        this.recursivePins = new Set(rKeys.map(k => cidToString(k)))

        this.log('Loaded pins from the datastore')
        return callback(null)
      })
    })
  }

  isPinnedWithType (multihash, type, callback) {
    const key = cidToString(multihash)
    const { recursive, direct, all } = PinTypes

    // recursive
    if ((type === recursive || type === all) && this.recursivePins.has(key)) {
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
    if ((type === direct || type === all) && this.directPins.has(key)) {
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
    detectLimit(this.recursiveKeys().map(key => new CID(key)), concurrencyLimit, (cid, cb) => {
      waterfall([
        (done) => this.dag.get(cid, '', { preload: false }, done),
        (result, done) => done(null, result.value),
        (node, done) => this.pinset.hasDescendant(node, key, done)
      ], cb)
    }, (err, cid) => callback(err, {
      key,
      pinned: Boolean(cid),
      reason: cid
    }))
  }

  // Gets CIDs of blocks used internally by the pinner
  getInternalBlocks (callback) {
    this.repo.datastore.get(PIN_DS_KEY, (err, mh) => {
      if (err) {
        if (err.code === 'ERR_NOT_FOUND') {
          this.log('No pinned blocks')
          return callback(null, [])
        }
        return callback(new Error(`Could not get pin sets root from datastore: ${err.message}`))
      }

      const cid = new CID(mh)
      this.dag.get(cid, '', { preload: false }, (err, obj) => {
        if (err) {
          return callback(new Error(`Could not get pin sets from store: ${err.message}`))
        }

        // The pinner stores an object that has two links to pin sets:
        // 1. The directly pinned CIDs
        // 2. The recursively pinned CIDs
        // If large enough, these pin sets may have links to buckets to hold
        // the pins
        this.pinset.getInternalCids(obj.value, (err, cids) => {
          if (err) {
            return callback(new Error(`Could not get pinner internal cids: ${err.message}`))
          }

          callback(null, cids.concat(cid))
        })
      })
    })
  }

  fetchCompleteDag (cid, options, callback) {
    this._walkDag({
      cid,
      preload: options.preload
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
