'use strict'

const promisify = require('promisify-es6')
const CID = require('cids')
const base32 = require('base32.js')
const parallel = require('async/parallel')
const mapLimit = require('async/mapLimit')
const { Key } = require('interface-datastore')
const log = require('debug')('ipfs:gc')

// Limit on the number of parallel block remove operations
const BLOCK_RM_CONCURRENCY = 256
const PIN_DS_KEY = new Key('/local/pins')
const MFS_ROOT_DS_KEY = new Key('/local/filesroot')

// Perform mark and sweep garbage collection
module.exports = function gc (self) {
  return promisify(async (callback) => {
    const start = Date.now()
    log(`Creating set of marked blocks`)

    self._gcLock.writeLock((lockCb) => {
      parallel([
        // Get all blocks from the blockstore
        (cb) => self._repo.blocks.query({ keysOnly: true }, cb),
        // Mark all blocks that are being used
        (cb) => createMarkedSet(self, cb)
      ], (err, [blocks, markedSet]) => {
        if (err) {
          log(`Error - ${err.message}`)
          return lockCb(err)
        }

        // Delete blocks that are not being used
        deleteUnmarkedBlocks(self, markedSet, blocks, start, (err, res) => {
          if (err) {
            log(`Error - ${err.message}`)
            return lockCb(err)
          }
          lockCb(null, res)
        })
      })
    }, callback)
  })
}

// Get Set of CIDs of blocks to keep
function createMarkedSet (ipfs, callback) {
  parallel([
    // "Empty block" used by the pinner
    // TODO: This CID is replicated in pin.js
    (cb) => cb(null, [new CID('QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n')]),

    // All pins, direct and indirect
    (cb) => ipfs.pin.ls((err, pins) => {
      if (err) {
        return cb(new Error(`Could not list pinned blocks: ${err.message}`))
      }
      log(`Found ${pins.length} pinned blocks`)
      cb(null, pins.map(p => new CID(p.hash)))
    }),

    // Blocks used internally by the pinner
    (cb) => ipfs._repo.datastore.get(PIN_DS_KEY, (err, mh) => {
      if (err) {
        if (err.code === 'ERR_NOT_FOUND') {
          log(`No pinned blocks`)
          return cb(null, [])
        }
        return cb(new Error(`Could not get pin sets root from datastore: ${err.message}`))
      }

      const cid = new CID(mh)
      ipfs.dag.get(cid, '', { preload: false }, (err, obj) => {
        if (err) {
          return cb(new Error(`Could not get pin sets from store: ${err.message}`))
        }

        // The pinner stores an object that has two links to pin sets:
        // 1. The directly pinned CIDs
        // 2. The recursively pinned CIDs
        cb(null, [cid, ...obj.value.Links.map(l => l.Hash)])
      })
    }),

    // The MFS root and all its descendants
    (cb) => ipfs._repo.datastore.get(MFS_ROOT_DS_KEY, (err, mh) => {
      if (err) {
        if (err.code === 'ERR_NOT_FOUND') {
          log(`No blocks in MFS`)
          return cb(null, [])
        }
        return cb(new Error(`Could not get MFS root from datastore: ${err.message}`))
      }

      getDescendants(ipfs, new CID(mh), cb)
    })
  ], (err, res) => {
    if (err) {
      return callback(err)
    }

    const cids = res.flat().map(cid => cid.toV1().toString('base32'))
    return callback(null, new Set(cids))
  })
}

// Recursively get descendants of the given CID
function getDescendants (ipfs, cid, callback) {
  ipfs.refs(cid, { recursive: true }, (err, refs) => {
    if (err) {
      return callback(new Error(`Could not get MFS root descendants from store: ${err.message}`))
    }
    log(`Found ${refs.length} MFS blocks`)
    callback(null, [cid, ...refs.map(r => new CID(r.ref))])
  })
}

// Delete all blocks that are not marked as in use
function deleteUnmarkedBlocks (ipfs, markedSet, blocks, start, callback) {
  // Iterate through all blocks and find those that are not in the marked set
  // The blocks variable has the form { { key: Key() }, { key: Key() }, ... }
  const unreferenced = []
  const res = []
  for (const { key: k } of blocks) {
    try {
      const cid = dsKeyToCid(k)
      if (!markedSet.has(cid.toV1().toString('base32'))) {
        unreferenced.push(cid)
      }
    } catch (err) {
      res.push({ err: new Error(`Could not convert block with key '${k}' to CID: ${err.message}`) })
    }
  }

  const msg = `Marked set has ${markedSet.size} blocks. Blockstore has ${blocks.length} blocks. ` +
    `Deleting ${unreferenced.length} blocks.`
  log(msg)

  mapLimit(unreferenced, BLOCK_RM_CONCURRENCY, (cid, cb) => {
    // Delete blocks from blockstore
    ipfs._repo.blocks.delete(cid, (err) => {
      const res = {
        cid: cid.toString(),
        err: err && new Error(`Could not delete block with CID ${cid}: ${err.message}`)
      }
      cb(null, res)
    })
  }, (_, delRes) => {
    log(`Complete (${Date.now() - start}ms)`)

    callback(null, res.concat(delRes))
  })
}

function dsKeyToCid (key) {
  // Block key is of the form /<base32 encoded string>
  const decoder = new base32.Decoder()
  const buff = decoder.write(key.toString().slice(1)).finalize()
  return new CID(buff)
}
