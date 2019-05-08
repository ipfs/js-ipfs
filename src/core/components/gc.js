'use strict'

const promisify = require('promisify-es6')
const CID = require('cids')
const base32 = require('base32.js')
const parallel = require('async/parallel')
const map = require('async/map')

module.exports = function gc (self) {
  return promisify(async (opts, callback) => {
    if (typeof opts === 'function') {
      callback = opts
      opts = {}
    }

    const start = Date.now()
    self.log(`GC: Creating set of marked blocks`)

    parallel([
      // Get all blocks from the blockstore
      (cb) => self._repo.blocks.query({ keysOnly: true }, cb),
      // Mark all blocks that are being used
      (cb) => createColoredSet(self, cb)
    ], (err, [blocks, coloredSet]) => {
      if (err) {
        self.log(`GC: Error - ${err.message}`)
        return callback(err)
      }

      // Delete blocks that are not being used
      deleteUnmarkedBlocks(self, coloredSet, blocks, start, (err, res) => {
        err && self.log(`GC: Error - ${err.message}`)
        callback(err, res)
      })
    })
  })
}

// TODO: make global constants
const { Key } = require('interface-datastore')
const pinDataStoreKey = new Key('/local/pins')
const MFS_ROOT_KEY = new Key('/local/filesroot')

function createColoredSet (ipfs, callback) {
  parallel([
    // "Empty block" used by the pinner
    (cb) => cb(null, ['QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n']),

    // All pins, direct and indirect
    (cb) => ipfs.pin.ls((err, pins) => {
      if (err) {
        return cb(new Error(`Could not list pinned blocks: ${err.message}`))
      }
      ipfs.log(`GC: Found ${pins.length} pinned blocks`)
      cb(null, pins.map(p => p.hash))
    }),

    // Blocks used internally by the pinner
    (cb) => ipfs._repo.datastore.get(pinDataStoreKey, (err, mh) => {
      if (err) {
        if (err.code === 'ERR_NOT_FOUND') {
          ipfs.log(`GC: No pinned blocks`)
          return cb(null, [])
        }
        return cb(new Error(`Could not get pin sets root from datastore: ${err.message}`))
      }

      const cid = new CID(mh)
      ipfs.dag.get(cid, '', { preload: false }, (err, obj) => {
        // TODO: Handle not found?
        if (err) {
          return cb(new Error(`Could not get pin sets from store: ${err.message}`))
        }

        // The pinner stores an object that has two links to pin sets:
        // 1. The directly pinned CIDs
        // 2. The recursively pinned CIDs
        cb(null, [cid.toString(), ...obj.value.links.map(l => l.cid.toString())])
      })
    }),

    // The MFS root and all its descendants
    (cb) => ipfs._repo.datastore.get(MFS_ROOT_KEY, (err, mh) => {
      if (err) {
        if (err.code === 'ERR_NOT_FOUND') {
          ipfs.log(`GC: No blocks in MFS`)
          return cb(null, [])
        }
        return cb(new Error(`Could not get MFS root from datastore: ${err.message}`))
      }

      getDescendants(ipfs, new CID(mh), cb)
    })
  ], (err, res) => callback(err, !err && new Set(res.flat())))
}

function getDescendants (ipfs, cid, callback) {
  // TODO: Make sure we don't go out to the network
  ipfs.refs(cid, { recursive: true }, (err, refs) => {
    if (err) {
      return callback(new Error(`Could not get MFS root descendants from store: ${err.message}`))
    }
    ipfs.log(`GC: Found ${refs.length} MFS blocks`)
    callback(null, [cid.toString(), ...refs.map(r => r.ref)])
  })
}

function deleteUnmarkedBlocks (ipfs, coloredSet, blocks, start, callback) {
  // Iterate through all blocks and find those that are not in the marked set
  // The blocks variable has the form { { key: Key() }, { key: Key() }, ... }
  const unreferenced = []
  const res = []
  for (const { key: k } of blocks) {
    try {
      const cid = dsKeyToCid(k)
      if (!coloredSet.has(cid.toString())) {
        unreferenced.push(cid)
      }
    } catch (err) {
      res.push({ err: new Error(`Could not convert block with key '${k}' to CID: ${err.message}`) })
    }
  }

  const msg = `GC: Marked set has ${coloredSet.size} blocks. Blockstore has ${blocks.length} blocks. ` +
    `Deleting ${unreferenced.length} blocks.`
  ipfs.log(msg)

  // TODO: limit concurrency
  map(unreferenced, (cid, cb) => {
    // Delete blocks from blockstore
    ipfs._repo.blocks.delete(cid, (err) => {
      const res = {
        cid: cid.toString(),
        err: err && new Error(`Could not delete block with CID ${cid}: ${err.message}`)
      }
      cb(null, res)
    })
  }, (_, delRes) => {
    ipfs.log(`GC: Complete (${Date.now() - start}ms)`)

    callback(null, res.concat(delRes))
  })
}

function dsKeyToCid (key) {
  // Block key is of the form /<base32 encoded string>
  const decoder = new base32.Decoder()
  const buff = decoder.write(key.toString().slice(1)).finalize()
  return new CID(buff)
}
