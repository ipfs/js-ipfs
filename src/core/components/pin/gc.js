'use strict'

const promisify = require('promisify-es6')
const CID = require('cids')
const base32 = require('base32.js')
const parallel = require('async/parallel')
const mapLimit = require('async/mapLimit')
const expErr = require('explain-error')
const { cidToString } = require('../../../utils/cid')
const log = require('debug')('ipfs:gc')
// TODO: Use exported key from root when upgraded to ipfs-mfs@>=13
// https://github.com/ipfs/js-ipfs-mfs/pull/58
const { MFS_ROOT_KEY } = require('ipfs-mfs/src/core/utils/constants')

// Limit on the number of parallel block remove operations
const BLOCK_RM_CONCURRENCY = 256

// Perform mark and sweep garbage collection
module.exports = function gc (self) {
  return promisify((callback) => {
    const start = Date.now()
    log('Creating set of marked blocks')

    self._gcLock.writeLock((lockCb) => {
      parallel([
        // Get all blocks keys from the blockstore
        (cb) => self._repo.blocks.query({ keysOnly: true }, cb),
        // Mark all blocks that are being used
        (cb) => createMarkedSet(self, cb)
      ], (err, [blockKeys, markedSet]) => {
        if (err) {
          log('GC failed to fetch all block keys and created marked set', err)
          return lockCb(err)
        }

        // Delete blocks that are not being used
        deleteUnmarkedBlocks(self, markedSet, blockKeys, (err, res) => {
          log(`Complete (${Date.now() - start}ms)`)

          if (err) {
            log('GC failed to delete unmarked blocks', err)
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
    // All pins, direct and indirect
    (cb) => ipfs.pin.ls((err, pins) => {
      if (err) {
        return cb(expErr(err, 'Could not list pinned blocks'))
      }
      log(`Found ${pins.length} pinned blocks`)
      const cids = pins.map(p => new CID(p.hash))
      // log('  ' + cids.join('\n  '))
      cb(null, cids)
    }),

    // Blocks used internally by the pinner
    (cb) => ipfs.pin._getInternalBlocks((err, cids) => {
      if (err) {
        return cb(expErr(err, 'Could not list pinner internal blocks'))
      }
      log(`Found ${cids.length} pinner internal blocks`)
      // log('  ' + cids.join('\n  '))
      cb(null, cids)
    }),

    // The MFS root and all its descendants
    (cb) => ipfs._repo.root.get(MFS_ROOT_KEY, (err, mh) => {
      if (err) {
        if (err.code === 'ERR_NOT_FOUND') {
          log('No blocks in MFS')
          return cb(null, [])
        }
        return cb(expErr(err, 'Could not get MFS root from datastore'))
      }

      getDescendants(ipfs, new CID(mh), cb)
    })
  ], (err, res) => {
    if (err) {
      return callback(err)
    }

    const cids = [].concat(...res).map(cid => cidToString(cid, { base: 'base32' }))
    return callback(null, new Set(cids))
  })
}

// Recursively get descendants of the given CID
function getDescendants (ipfs, cid, callback) {
  ipfs.refs(cid, { recursive: true }, (err, refs) => {
    if (err) {
      return callback(expErr(err, 'Could not get MFS root descendants from store'))
    }
    const cids = [cid, ...refs.map(r => new CID(r.ref))]
    log(`Found ${cids.length} MFS blocks`)
    // log('  ' + cids.join('\n  '))
    callback(null, cids)
  })
}

// Delete all blocks that are not marked as in use
function deleteUnmarkedBlocks (ipfs, markedSet, blockKeys, callback) {
  // Iterate through all blocks and find those that are not in the marked set
  // The blockKeys variable has the form [ { key: Key() }, { key: Key() }, ... ]
  const unreferenced = []
  const res = []
  let errCount = 0
  for (const { key: k } of blockKeys) {
    try {
      const cid = dsKeyToCid(k)
      const b32 = cid.toV1().toString('base32')
      if (!markedSet.has(b32)) {
        unreferenced.push(cid)
      }
    } catch (err) {
      errCount++
      const msg = `Could not convert block with key '${k}' to CID`
      log(msg, err)
      res.push({ err: new Error(msg + `: ${err.message}`) })
    }
  }

  const msg = `Marked set has ${markedSet.size} unique blocks. Blockstore has ${blockKeys.length} blocks. ` +
    `Deleting ${unreferenced.length} blocks.` + (errCount ? ` (${errCount} errors)` : '')
  log(msg)
  // log('  ' + unreferenced.join('\n  '))

  mapLimit(unreferenced, BLOCK_RM_CONCURRENCY, (cid, cb) => {
    // Delete blocks from blockstore
    ipfs._repo.blocks.delete(cid, (err) => {
      const res = {
        cid,
        err: err && new Error(`Could not delete block with CID ${cid}: ${err.message}`)
      }
      cb(null, res)
    })
  }, (_, delRes) => {
    callback(null, res.concat(delRes))
  })
}

// TODO: Use exported utility when upgrade to ipfs-repo@>=0.27.1
// https://github.com/ipfs/js-ipfs-repo/pull/206
function dsKeyToCid (key) {
  // Block key is of the form /<base32 encoded string>
  const decoder = new base32.Decoder()
  const buff = decoder.write(key.toString().slice(1)).finalize()
  return new CID(Buffer.from(buff))
}
