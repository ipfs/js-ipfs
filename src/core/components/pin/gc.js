'use strict'

const CID = require('cids')
const base32 = require('base32.js')
const callbackify = require('callbackify')
const { cidToString } = require('../../../utils/cid')
const log = require('debug')('ipfs:gc')
const { default: Queue } = require('p-queue')
// TODO: Use exported key from root when upgraded to ipfs-mfs@>=13
// https://github.com/ipfs/js-ipfs-mfs/pull/58
const { MFS_ROOT_KEY } = require('ipfs-mfs/src/core/utils/constants')

const { Errors } = require('interface-datastore')
const ERR_NOT_FOUND = Errors.notFoundError().code

// Limit on the number of parallel block remove operations
const BLOCK_RM_CONCURRENCY = 256

// Perform mark and sweep garbage collection
module.exports = function gc (self) {
  return callbackify(async () => {
    const start = Date.now()
    log('Creating set of marked blocks')

    const release = await self._gcLock.writeLock()

    try {
      const [
        blockKeys, markedSet
      ] = await Promise.all([
        // Get all blocks keys from the blockstore
        self._repo.blocks.query({ keysOnly: true }),

        // Mark all blocks that are being used
        createMarkedSet(self)
      ])

      // Delete blocks that are not being used
      const res = await deleteUnmarkedBlocks(self, markedSet, blockKeys)

      log(`Complete (${Date.now() - start}ms)`)

      return res
    } finally {
      release()
    }
  })
}

// Get Set of CIDs of blocks to keep
async function createMarkedSet (ipfs) {
  const output = new Set()

  const addPins = pins => {
    log(`Found ${pins.length} pinned blocks`)

    pins.forEach(pin => {
      output.add(cidToString(new CID(pin), { base: 'base32' }))
    })
  }

  await Promise.all([
    // All pins, direct and indirect
    ipfs.pin.ls()
      .then(pins => pins.map(pin => pin.hash))
      .then(addPins),

    // Blocks used internally by the pinner
    ipfs.pin.pinManager.getInternalBlocks()
      .then(addPins),

    // The MFS root and all its descendants
    ipfs._repo.root.get(MFS_ROOT_KEY)
      .then(mh => getDescendants(ipfs, new CID(mh)))
      .then(addPins)
      .catch(err => {
        if (err.code === ERR_NOT_FOUND) {
          log('No blocks in MFS')
          return []
        }

        throw err
      })
  ])

  return output
}

// Recursively get descendants of the given CID
async function getDescendants (ipfs, cid) {
  const refs = await ipfs.refs(cid, { recursive: true })
  const cids = [cid, ...refs.map(r => new CID(r.ref))]
  log(`Found ${cids.length} MFS blocks`)
  // log('  ' + cids.join('\n  '))

  return cids
}

// Delete all blocks that are not marked as in use
async function deleteUnmarkedBlocks (ipfs, markedSet, blockKeys) {
  // Iterate through all blocks and find those that are not in the marked set
  // The blockKeys variable has the form [ { key: Key() }, { key: Key() }, ... ]
  const unreferenced = []
  const result = []

  const queue = new Queue({
    concurrency: BLOCK_RM_CONCURRENCY
  })

  for await (const { key: k } of blockKeys) {
    try {
      const cid = dsKeyToCid(k)
      const b32 = cid.toV1().toString('base32')
      if (!markedSet.has(b32)) {
        unreferenced.push(cid)

        queue.add(async () => {
          const res = {
            cid
          }

          try {
            await ipfs._repo.blocks.delete(cid)
          } catch (err) {
            res.err = new Error(`Could not delete block with CID ${cid}: ${err.message}`)
          }

          result.push(res)
        })
      }
    } catch (err) {
      const msg = `Could not convert block with key '${k}' to CID`
      log(msg, err)
      result.push({ err: new Error(msg + `: ${err.message}`) })
    }
  }

  await queue.onIdle()

  log(`Marked set has ${markedSet.size} unique blocks. Blockstore has ${blockKeys.length} blocks. ` +
  `Deleted ${unreferenced.length} blocks.`)

  return result
}

// TODO: Use exported utility when upgrade to ipfs-repo@>=0.27.1
// https://github.com/ipfs/js-ipfs-repo/pull/206
function dsKeyToCid (key) {
  // Block key is of the form /<base32 encoded string>
  const decoder = new base32.Decoder()
  const buff = decoder.write(key.toString().slice(1)).finalize()
  return new CID(Buffer.from(buff))
}
